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
gh release create "$RELEASE_TAG" "${args[@]}"
if [[ "$promote" == true ]]; then
  while IFS= read -r source; do
    registry=${source%@*}
    docker buildx imagetools create --tag "$registry:latest" "$source"
    [[ $(digest "$registry:latest") == "${source#*@}" ]]
  done < "$work/published"
  gh release edit "$RELEASE_TAG" --repo "$GITHUB_REPOSITORY" --latest
fi
cat "$work/release-notes" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
printf '\nLatest promoted: %s\n' "$promote" >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
