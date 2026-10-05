# Releases and rollback

## Version contract

`package.json` is the version authority. The next planned version is **3.1.13**;
this does not create a release. Use strict SemVer (for example `3.1.13` or
`3.2.0-rc.1`), without build metadata or leading zeroes. Push only the matching
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
retrying. A retry before immutable tags exist is safe; after they exist, the
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
