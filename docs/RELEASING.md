# Releases and rollback

## Version contract

`package.json` is the version authority. The next planned version is **3.1.13**;
this does not create a release. Use strict SemVer (for example `3.1.13` or
`3.2.0-rc.1`), without build metadata or leading zeroes. Create only the matching
`v<package.version>` tag after reviewing and explicitly approving the release.
Historical prerelease-style hotfix tags such as `v3.1.9-fix` do not represent
stable versions; do not reuse them.

Release builds receive `RELEASE_TAG` and `COMMIT_SHA` at build time. Their footer
links to that release. Untagged builds show the planned version plus a development
SHA and link to the commit; a source archive without Git metadata shows `local`.
Setting `RELEASE_TAG` incorrectly fails the build. These public values are build
metadata, never secrets.

## Before tagging

1. Update `package.json` in a reviewed change; do not rewrite an existing tag.
2. Run `pnpm test:release`, `pnpm exec tsc --noEmit`, and `pnpm build`.
3. Confirm **Container and PWA validation** passes on the exact main commit,
   including native amd64/arm64 startup/auth/image tests and Chromium offline
   reload, password-gate and recovery checks. PR validation is read-only: no
   registry login, push or release creation occurs. Both PR and release runs also
   round-trip the tested archives through Actions artifacts and verify image IDs,
   architecture and source revision after downloading them.
4. Review compatibility and release notes, then obtain release approval. Creating
   a tag triggers production publication. Merging a version bump alone does not.

## Publish from the GitHub website

The tag-first path remains supported: push the approved tag without first making
a Release, and the workflow creates it after both registry versions are verified.
Alternatively, GitHub's **Draft a new release** page can create the tag and a
published **pending prerelease** together. This uses the same tag-push workflow;
there is deliberately no second `release` event trigger.

1. Complete **Before tagging**, including approval, on the exact commit. Select
   the new matching tag and that commit as its target. Do not select a moving
   branch unless you have checked that it still points to the approved SHA.
2. For `v3.1.13`, use the exact title `v3.1.13 (publication pending)` and the body
   below, replacing `FULL_40_CHARACTER_COMMIT_SHA` with that commit's lowercase
   full SHA. Do not generate notes or add any other content or uploaded assets.
   CRLF versus LF and final newlines are accepted; all other wording is exact.

   ```text
   Publication pending: native image validation and registry publication are not complete.

   <!-- nezha-dash:pending-release v3.1.13 FULL_40_CHARACTER_COMMIT_SHA -->
   ```

3. Choose the **Pre-release** label, even for a stable version. Do not choose
   **Latest**. Publish the release (do not merely save a draft).
   The visible pending title/body means this is not yet a completed release.
4. Wait for native validation and publication. Do not edit the pending release
   while that workflow runs. The workflow verifies the marker, actual tag SHA,
   exact pending title/body, published prerelease state, and empty assets before
   any registry write. Its author login and numeric ID must match the original
   tag workflow's `GITHUB_ACTOR`/`GITHUB_ACTOR_ID`, and that person must still have
   write/admin access. The permission lookup needs only existing metadata read
   access, not a new token or permission. Reruns retain the original actor;
   another rerunner does not authorize a different release author.
5. After both immutable registry versions verify, the workflow rechecks the tag
   and pending release snapshot, generates notes, then edits the **same release
   ID**. Stable tags lose prerelease status; actual `-rc.1`-style tags retain it.
   GitHub latest remains off until both eligible registry latest pointers verify.
   Older stable versions never promote latest. No tag, target, asset, or release
   identity is changed. GitHub immutable releases support these metadata edits:
   [immutable release behavior](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases).

An arbitrary existing release, wrong marker/author/status, uploaded assets, or an
API authentication/network failure stops publication. Only an actual HTTP 404
on the tag-release lookup, followed by a successful GraphQL check confirming no
release or saved draft, selects the original create-new-release path. A draft
alone does not create a tag or start publication; do not mix a saved draft with
the tag-first path. If the pending release changes or disappears mid-run, stop
and inspect the logs rather than overwriting or recreating it.

## Publication contract

The tag workflow calls the same container validation workflow, passing release
metadata. Each architecture builds natively, tests its loaded image, then uploads
that Docker archive and image ID. Only after **both** jobs succeed does the
Production job load those archives, verify their IDs, architecture and source
revision, push them and assemble manifest lists from registry digests. It never
rebuilds tested images. Docker Hub and Aliyun destinations and existing credential
names are unchanged. OCI source/revision/version/created labels are retained.
Docker archive transport does not retain BuildKit provenance attestations; image
IDs, registry digests and OCI labels provide traceability, not signed provenance.

Published version tags and full `sha-<commit>` tags are write-once under this
workflow. Existing targets stop publication rather than silently overwrite an
image. Temporary `validated-<run>-<attempt>-<arch>` tags retain the tested
architecture images for recovery. Release notes and the job summary record both
registry manifest digests. For strict deployment reproducibility, pin a digest.
Registries are not configured for immutable tags by this change; another writer
could still overwrite them.

All publication jobs share one concurrency group, with active jobs never canceled.
GitHub may replace an older **pending** job; inspect the Actions queue when
publishing several tags. Under the lock, the workflow fetches current Git tags
and checks the current `latest` OCI version in **both** registries. Only a stable
version at least as high as every existing stable version may promote `latest`.
Prereleases and older releases remain version-addressable and never become
GitHub's latest release or a registry's latest. Registry/network errors or unknown
latest version labels fail closed. New Git tags created after this check are
handled by their later serialized publication; a higher published latest cannot
be downgraded by this workflow.

## Failures and recovery

Publication across two registries and GitHub is not atomic. A failure can leave
staging images, one registry's immutable version, a GitHub release, or one latest
pointer updated. Check the Actions logs and recorded image/manifest digests before
retrying. With the web path, validation or partial image publication leaves the
release visibly pending. Once both version manifests verify, finalization can
succeed even if a later latest update fails; that release is complete but not
latest. Conversely a GitHub API timeout can leave an update's outcome uncertain.
There is no atomic compare-and-swap across GitHub and registries: the snapshot
recheck detects earlier edits, but operators must not edit during finalization.
Inspect the actual release ID/state and both registries before recovery. Do not
remove the pending marker or mark stable/latest manually before both images are
verified. A retry before immutable tags exist is safe; after they exist, the
write-once preflight deliberately stops, even for the same SHA. With explicit
approval, complete missing registry/release/latest steps using the **original
recorded digests**, and verify both architectures and metadata. Do not rebuild
under or delete/recreate the existing version tag. If the original artifacts
cannot be established, cut a new patch release after validation.

Do not rerun historical Deploy jobs from before this change: they execute their
old unchecked workflow and can overwrite `latest`. These guards apply to new
workflow runs; they are not repository/registry access controls.

## Rollback

Deploy the previous known-good version **by recorded registry digest**, using the
existing deployment process and its approval. Check startup, authentication and
PWA behavior after switching; service-worker updates can persist in browsers.
Do not move the Git tag or rewrite immutable image tags. A deliberate `latest`
rollback is a separate approved operator action, outside the automatic monotonic
policy. Prefer a new validated patch release to restore the normal update path.
