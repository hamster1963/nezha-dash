const assert = require("node:assert/strict")
const { test } = require("node:test")
const { version: packageVersion } = require("../package.json")
const { getBuildInfo } = require("./build-info.cjs")

const REPOSITORY_URL = "https://github.com/hamster1963/nezha-dash"
const SHA = "1234567890abcdef1234567890abcdef12345678"
const GIT_SHA = "abcdef1234567890abcdef1234567890abcdef12"
const noGit = () => ""

test("only an explicit matching release tag links a release", () => {
  for (const version of ["3.1.13", "3.1.13-rc.1"]) {
    assert.deepEqual(
      getBuildInfo({
        version,
        env: { RELEASE_TAG: `v${version}`, COMMIT_SHA: SHA },
        gitSha: () => {
          throw new Error("Release metadata does not need git")
        },
      }),
      {
        version,
        label: `v${version}`,
        url: `${REPOSITORY_URL}/releases/tag/v${version}`,
      },
    )
  }
})

test("untagged builds link their commit", () => {
  for (const RELEASE_TAG of [undefined, ""]) {
    assert.deepEqual(
      getBuildInfo({
        version: "3.1.13",
        env: { RELEASE_TAG, COMMIT_SHA: SHA },
        gitSha: noGit,
      }),
      {
        version: "3.1.13",
        label: "v3.1.13-dev.1234567",
        url: `${REPOSITORY_URL}/commit/${SHA}`,
      },
    )
  }
})

test("explicit mismatched or invalid release tags fail the build", () => {
  for (const RELEASE_TAG of [
    "v3.1.12",
    "3.1.13",
    "V3.1.13",
    "v3.1.13+meta",
    "v3.1.13\n",
    " ",
    "v03.1.13",
  ]) {
    assert.throws(
      () =>
        getBuildInfo({ version: "3.1.13", env: { RELEASE_TAG, COMMIT_SHA: SHA }, gitSha: noGit }),
      /RELEASE_TAG must be the valid release tag v3\.1\.13/,
    )
  }
})

test("COMMIT_SHA takes precedence over git and is normalized", () => {
  const result = getBuildInfo({
    version: "3.1.13",
    env: { COMMIT_SHA: SHA.toUpperCase() },
    gitSha: () => {
      throw new Error("Must not invoke git when a SHA was supplied")
    },
  })
  assert.equal(result.label, "v3.1.13-dev.1234567")
  assert.equal(result.url, `${REPOSITORY_URL}/commit/${SHA}`)
})

test("git SHA is used when COMMIT_SHA is missing or invalid", () => {
  for (const COMMIT_SHA of [
    undefined,
    "",
    "oops",
    "abcdef",
    "abc1234\n",
    "../bad/path",
    "a".repeat(65),
  ]) {
    const result = getBuildInfo({ version: "3.1.13", env: { COMMIT_SHA }, gitSha: () => GIT_SHA })
    assert.equal(result.label, "v3.1.13-dev.abcdef1")
    assert.equal(result.url, `${REPOSITORY_URL}/commit/${GIT_SHA}`)
  }
})

test("SHA-256 git hashes and abbreviated hashes are supported", () => {
  for (const sha of ["abcdef1", "a".repeat(64)]) {
    const result = getBuildInfo({ version: "3.1.13", env: { COMMIT_SHA: sha }, gitSha: noGit })
    assert.equal(result.label, `v3.1.13-dev.${sha.slice(0, 7)}`)
    assert.equal(result.url, `${REPOSITORY_URL}/commit/${sha}`)
  }
})

test("source archives without git get an honest local label and repository link", () => {
  for (const gitSha of [noGit, () => "not-a-hash", () => `${SHA}\n`]) {
    assert.deepEqual(getBuildInfo({ version: "3.1.13", env: {}, gitSha }), {
      version: "3.1.13",
      label: "v3.1.13-dev.local",
      url: REPOSITORY_URL,
    })
  }
})

test("package.json supplies the default version", () => {
  assert.deepEqual(getBuildInfo({ env: {}, gitSha: noGit }), {
    version: packageVersion,
    label: `v${packageVersion}-dev.local`,
    url: REPOSITORY_URL,
  })
})
