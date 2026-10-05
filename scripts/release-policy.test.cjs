const assert = require("node:assert/strict")
const { spawnSync } = require("node:child_process")
const { tmpdir } = require("node:os")
const { resolve } = require("node:path")
const { test } = require("node:test")
const { version } = require("../package.json")
const { validateTag, canPromoteLatest } = require("./release-policy.cjs")

test("release tags must exactly match the authoritative package version", () => {
  for (const version of ["0.0.0", "3.1.13", "3.1.13-rc.1", "1.0.0-0", "1.0.0-01a.-.A"]) {
    assert.equal(validateTag(version, `v${version}`), true, version)
  }
  assert.equal(validateTag("3.1.13", "v3.1.12"), false)
  assert.equal(validateTag("3.1.13", "3.1.13"), false)
  assert.equal(validateTag("v3.1.13", "v3.1.13"), false)
  assert.equal(validateTag(version, `v${version}`), true)
})

test("invalid SemVer and non-Docker-compatible tags are rejected", () => {
  for (const version of [
    "",
    "1",
    "1.2",
    "1.2.3.4",
    "01.2.3",
    "1.02.3",
    "1.2.03",
    "1.2.3-",
    "1.2.3-01",
    "1.2.3-rc.01",
    "1.2.3-rc..1",
    "1.2.3-.rc",
    "1.2.3-rc_1",
    "1.2.3+build",
    "1.2.3-rc.1+build",
    "1.2.3 ",
    " 1.2.3",
    "1.2.3\n",
    "1.2.3\r",
    "1.2.3\0",
    "1.2.3-你好",
    `1.2.3-${"a".repeat(122)}`,
  ]) {
    assert.equal(validateTag(version, `v${version}`), false, JSON.stringify(version))
  }
  assert.equal(validateTag(null, "vnull"), false)
  assert.equal(validateTag(123, "v123"), false)
  assert.equal(validateTag("1.2.3", null), false)
  assert.equal(validateTag("1.2.3", "V1.2.3"), false)
  const maxLength = `1.2.3-${"a".repeat(121)}`
  assert.equal(`v${maxLength}`.length, 128)
  assert.equal(validateTag(maxLength, `v${maxLength}`), true)
})

test("latest accepts a first stable release and equal tags for retries", () => {
  assert.equal(canPromoteLatest("v3.1.13", []), true)
  assert.equal(canPromoteLatest("v3.1.13", ["v3.1.13", "v3.1.12"]), true)
  assert.equal(canPromoteLatest("v3.1.13", ["v3.1.13", "v3.1.14"]), false)
})

test("latest compares major, minor and patch numerically, without rolling back", () => {
  const cases = [
    ["v3.1.13", "v3.1.9", true],
    ["v3.1.9", "v3.1.13", false],
    ["v3.10.0", "v3.9.99", true],
    ["v3.9.99", "v3.10.0", false],
    ["v10.0.0", "v9.99.99", true],
    ["v9.99.99", "v10.0.0", false],
    ["v2.0.0", "v1.999.999", true],
  ]
  for (const [candidate, existing, expected] of cases) {
    assert.equal(canPromoteLatest(candidate, [existing]), expected, `${candidate} vs ${existing}`)
  }
})

test("latest handles arbitrarily large numeric components without rounding", () => {
  for (let index = 0; index < 3; index++) {
    const lower = ["1", "2", "3"]
    const higher = [...lower]
    lower[index] = "9007199254740992"
    higher[index] = "9007199254740993"
    assert.equal(canPromoteLatest(`v${lower.join(".")}`, [`v${higher.join(".")}`]), false)
    assert.equal(canPromoteLatest(`v${higher.join(".")}`, [`v${lower.join(".")}`]), true)
  }
  assert.equal(canPromoteLatest("v100000000000000000000.0.0", ["v99999999999999999999.0.0"]), true)
})

test("prereleases never promote latest; unrelated and invalid existing tags do not block", () => {
  for (const tag of [
    "v3.1.13-rc.1",
    "v3.1.13-0",
    "latest",
    "3.1.13",
    "v03.1.13",
    "v3.1.13+meta",
    null,
  ]) {
    assert.equal(canPromoteLatest(tag, []), false)
  }
  assert.equal(
    canPromoteLatest("v3.1.13", [
      "v99.0.0-rc.1",
      "v99.0.0+build",
      "v099.0.0",
      "99.0.0",
      "latest",
      "nightly",
      "",
      null,
    ]),
    true,
  )
})

function runCli(args, input = "") {
  return spawnSync(process.execPath, [resolve(__dirname, "release-policy.cjs"), ...args], {
    encoding: "utf8",
    cwd: tmpdir(),
    input,
  })
}

test("CLI check loads package.json relative to the script and fails closed", () => {
  const success = runCli(["check", `v${version}`])
  assert.equal(success.status, 0, success.stderr)
  assert.match(success.stdout, /Validated/)
  for (const tag of ["v0.0.0", "v01.2.3", "latest", `${version}`, `v${version}+build`]) {
    const failure = runCli(["check", tag])
    assert.equal(failure.status, 1, tag)
    assert.match(failure.stderr, /Release tag must be/)
    assert.equal(failure.stdout, "")
  }
})

test("CLI latest consumes newline-delimited tags and prints only a boolean", () => {
  for (const [candidate, input, expected] of [
    ["v3.1.13", "", "true\n"],
    ["v3.1.13", "v3.1.9\nv3.1.13\n", "true\n"],
    ["v3.1.13", "v3.1.14\r\nv99.0.0-rc.1\r\n", "false\n"],
    ["v3.1.13-rc.1", "v3.1.12\n", "false\n"],
    ["invalid", "", "false\n"],
  ]) {
    const result = runCli(["latest", candidate], input)
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.stdout, expected)
    assert.equal(result.stderr, "")
  }
})

test("CLI rejects missing arguments, unknown commands, and extra arguments", () => {
  for (const args of [
    [],
    ["check"],
    ["latest"],
    ["unknown", "v1.2.3"],
    ["check", "v1.2.3", "extra"],
  ]) {
    const result = runCli(args)
    assert.equal(result.status, 1)
    assert.match(result.stderr, /Usage:/)
  }
})
