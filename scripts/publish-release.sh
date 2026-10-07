#!/usr/bin/env bash
# Invoked only by the serialized, tag-triggered Production job.
set -euo pipefail
: "${RELEASE_TAG:?}" "${COMMIT_SHA:?}" "${REGISTRY_IMAGE:?}" "${ALIYUN_REGISTRY_IMAGE:?}"
: "${GITHUB_RUN_ID:?}" "${GITHUB_RUN_ATTEMPT:?}" "${GITHUB_REPOSITORY:?}"
images=${1:?tested image directory required}
node scripts/release-policy.cjs check "$RELEASE_TAG"
[[ "$COMMIT_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid commit SHA' >&2; exit 1; }
[[ $(git rev-parse HEAD) == "$COMMIT_SHA" ]] || { echo 'Checkout SHA mismatch' >&2; exit 1; }
registries=("$REGISTRY_IMAGE" "$ALIYUN_REGISTRY_IMAGE")
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

# Missing manifests alone are safe to create; transport/auth errors fail closed.
manifest_exists() {
  if docker buildx imagetools inspect "$1" > "$work/inspect" 2> "$work/error"; then return 0; fi
  if grep -Eqi 'manifest unknown|no such manifest|: not found' "$work/error"; then return 1; fi
  cat "$work/error" >&2
  exit 1
}
digest() {
  docker buildx imagetools inspect "$1" --format '{{json .Manifest}}' | jq -er '.digest | select(test("^sha256:[0-9a-f]{64}$"))'
}

# Refresh AFTER entering the concurrency lock. Never infer latest from tag time.
git fetch origin --tags
[[ $(git rev-parse "refs/tags/$RELEASE_TAG^{commit}") == "$COMMIT_SHA" ]] || { echo 'Tag SHA mismatch' >&2; exit 1; }

# Only a real HTTP 404 means absent. Auth, transport, and malformed responses
# must not turn an arbitrary existing release into the tag-first create path.
api="repos/$GITHUB_REPOSITORY"
read_release() {
  if gh api --include "$api/releases/tags/$RELEASE_TAG" > "$work/response" 2> "$work/error"; then
    sed '1,/^[[:space:]]*$/d' "$work/response" > "$1"
    jq -e 'type == "object"' "$1" > /dev/null || exit 1
    return 0
  fi
  if head -n 1 "$work/response" | grep -Eq '^HTTP/[0-9.]+ 404([[:space:]]|$)'; then
    # REST's tag endpoint hides drafts. Also confirm absence via GraphQL, as
    # gh release create could otherwise collide with an operator's saved draft.
    gh api graphql -f query='query($owner:String!, $name:String!, $tag:String!) { repository(owner:$owner, name:$name) { release(tagName:$tag) { id } } }' \
      -f owner="${GITHUB_REPOSITORY%/*}" -f name="${GITHUB_REPOSITORY#*/}" -f tag="$RELEASE_TAG" > "$work/draft-check" || exit 1
    jq -e '(.errors // [] | length == 0) and (.data.repository | type == "object" and has("release") and .release == null)' "$work/draft-check" > /dev/null || {
      echo 'Release absence is unconfirmed or a draft already exists' >&2; exit 1;
    }
    return 1
  fi
  cat "$work/error" >&2
  exit 1
}
release_snapshot() {
  jq -cS '{id, tag_name, target_commitish, name,
    body: (.body | gsub("\r\n"; "\n") | sub("\n+$"; "")),
    draft, prerelease, author: (.author | {login, id, type}), assets, immutable, published_at}' "$1"
}
release_id=""
if read_release "$work/release"; then
  : "${GITHUB_ACTOR:?}" "${GITHUB_ACTOR_ID:?}"
  [[ "$GITHUB_ACTOR_ID" =~ ^[1-9][0-9]*$ ]]
  pending_body=$(printf 'Publication pending: native image validation and registry publication are not complete.\n\n<!-- nezha-dash:pending-release %s %s -->' "$RELEASE_TAG" "$COMMIT_SHA")
  jq -e --arg tag "$RELEASE_TAG" --arg body "$pending_body" \
    --arg actor "$GITHUB_ACTOR" --argjson actor_id "$GITHUB_ACTOR_ID" '
    (.id | type == "number" and . > 0 and floor == .) and
    .tag_name == $tag and .name == ($tag + " (publication pending)") and
    (.body | gsub("\r\n"; "\n") | sub("\n+$"; "")) == $body and
    .draft == false and .prerelease == true and (.published_at | type == "string" and length > 0) and
    .assets == [] and .author.type == "User" and
    .author.login == $actor and .author.id == $actor_id' "$work/release" > /dev/null || {
      echo 'Refusing an existing release that is not the expected pending prerelease' >&2; exit 1;
    }
  # This endpoint requires only repository metadata:read, already available to
  # GITHUB_TOKEN. GITHUB_ACTOR stays the original tag actor on reruns; do not use
  # GITHUB_TRIGGERING_ACTOR to authorize a different release author.
  gh api "$api/collaborators/$GITHUB_ACTOR/permission" > "$work/permission"
  jq -e --arg actor "$GITHUB_ACTOR" --argjson actor_id "$GITHUB_ACTOR_ID" '
    (.permission == "admin" or .permission == "write") and
    .user.login == $actor and .user.id == $actor_id' "$work/permission" > /dev/null
  release_id=$(jq -r '.id' "$work/release")
  release_snapshot "$work/release" > "$work/expected-release"
fi

git tag --list 'v*' > "$work/versions"
for registry in "${registries[@]}"; do
  for tag in "$RELEASE_TAG" "sha-$COMMIT_SHA"; do
    if manifest_exists "$registry:$tag"; then
      echo "Refusing to overwrite immutable $registry:$tag; see docs/RELEASING.md recovery" >&2
      exit 1
    fi
  done
  if manifest_exists "$registry:latest"; then
    # Legacy releases also carry this metadata-action OCI label.
    docker pull --platform linux/amd64 "$registry:latest" > /dev/null
    version=$(docker image inspect "$registry:latest" --format '{{index .Config.Labels "org.opencontainers.image.version"}}')
    version=${version#v}
    node -e 'if(!require("./scripts/release-policy.cjs").validateTag(process.argv[1],"v"+process.argv[1]))process.exit(1)' "$version"
    printf 'v%s\n' "$version" >> "$work/versions"
  fi
done
promote=$(node scripts/release-policy.cjs latest "$RELEASE_TAG" < "$work/versions")

# Validate BOTH archives before any remote write. IDs are Docker config digests.
for arch in amd64 arm64; do
  docker load -i "$images/$arch.tar.gz"
  id=$(cat "$images/$arch.id")
  [[ "$id" =~ ^sha256:[0-9a-f]{64}$ ]]
  [[ $(docker image inspect nezha-validation --format '{{.Id}}') == "$id" ]]
  [[ $(docker image inspect "$id" --format '{{.Architecture}}') == "$arch" ]]
  [[ $(docker image inspect "$id" --format '{{index .Config.Labels "org.opencontainers.image.revision"}}') == "$COMMIT_SHA" ]]
  [[ $(docker image inspect "$id" --format '{{index .Config.Labels "org.opencontainers.image.version"}}') == "$RELEASE_TAG" ]]
done

: > "$work/release-notes"
# shellcheck disable=SC2016 # Markdown backticks are literal.
printf 'Commit: `%s`\n\nTested native linux/amd64 and linux/arm64 images:\n' "$COMMIT_SHA" >> "$work/release-notes"
for registry in "${registries[@]}"; do
  sources=()
  for arch in amd64 arm64; do
    stage="$registry:validated-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT-$arch"
    docker tag "$(cat "$images/$arch.id")" "$stage"
    docker push "$stage"
    sources+=("$registry@$(digest "$stage")")
  done
  docker buildx imagetools create --tag "$registry:$RELEASE_TAG" --tag "$registry:sha-$COMMIT_SHA" "${sources[@]}"
  released=$(digest "$registry:$RELEASE_TAG")
  [[ $(digest "$registry:sha-$COMMIT_SHA") == "$released" ]]
  # shellcheck disable=SC2016 # Markdown backticks are literal.
  printf -- '- `%s@%s` (`%s`, `sha-%s`)\n' "$registry" "$released" "$RELEASE_TAG" "$COMMIT_SHA" >> "$work/release-notes"
  printf '%s@%s\n' "$registry" "$released" >> "$work/published"
done

# Use the runner's GitHub CLI, avoiding an unpinned downloaded changelog program.
args=(--repo "$GITHUB_REPOSITORY" --verify-tag --generate-notes --notes-file "$work/release-notes" --latest=false)
if [[ "$RELEASE_TAG" == *-* ]]; then args+=(--prerelease); fi
if [[ -z "$release_id" ]]; then
  gh release create "$RELEASE_TAG" "${args[@]}"
else
  gh api --method POST "$api/releases/generate-notes" -f tag_name="$RELEASE_TAG" > "$work/generated-notes"
  printf '\n' >> "$work/release-notes"
  jq -er '.body | select(type == "string")' "$work/generated-notes" >> "$work/release-notes"
  # Recheck the tag and the entire pending shape before editing the same ID.
  # Never adopt a replacement release or overwrite notes changed by an operator.
  git fetch origin --tags
  [[ $(git rev-parse "refs/tags/$RELEASE_TAG^{commit}") == "$COMMIT_SHA" ]]
  read_release "$work/release-current" || { echo 'Pending release disappeared' >&2; exit 1; }
  release_snapshot "$work/release-current" > "$work/current-release"
  cmp -s "$work/expected-release" "$work/current-release" || { echo 'Pending release changed during publication' >&2; exit 1; }
  prerelease=false
  if [[ "$RELEASE_TAG" == *-* ]]; then prerelease=true; fi
  # Immutable GitHub releases allow title/body/prerelease/latest edits. Never
  # change their tag, target, assets, draft state, or identity.
  gh api --method PATCH "$api/releases/$release_id" -f name="$RELEASE_TAG" \
    -F body=@"$work/release-notes" -F prerelease="$prerelease" -f make_latest=false > "$work/final-release"
  jq -e --argjson id "$release_id" --arg tag "$RELEASE_TAG" --argjson prerelease "$prerelease" \
    --rawfile body "$work/release-notes" '
    .id == $id and .tag_name == $tag and .name == $tag and .body == $body and
    .draft == false and .prerelease == $prerelease and .assets == []' "$work/final-release" > /dev/null
fi
if [[ "$promote" == true ]]; then
  while IFS= read -r source; do
    registry=${source%@*}
    docker buildx imagetools create --tag "$registry:latest" "$source"
    [[ $(digest "$registry:latest") == "${source#*@}" ]]
  done < "$work/published"
  if [[ -n "$release_id" ]]; then
    gh api --method PATCH "$api/releases/$release_id" -f make_latest=true > /dev/null
  else
    gh release edit "$RELEASE_TAG" --repo "$GITHUB_REPOSITORY" --latest
  fi
fi
cat "$work/release-notes" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
printf '\nLatest promoted: %s\n' "$promote" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
