const assert = require("node:assert/strict")
const { spawnSync } = require("node:child_process")
const fs = require("node:fs")
const os = require("node:os")
const path = require("node:path")
const test = require("node:test")

const root = path.resolve(__dirname, "..")
const commit = "a".repeat(40)
const ids = { amd64: `sha256:${"a".repeat(64)}`, arm64: `sha256:${"b".repeat(64)}` }
const digests = { amd64: `sha256:${"c".repeat(64)}`, arm64: `sha256:${"d".repeat(64)}` }
const indexDigest = `sha256:${"e".repeat(64)}`
const registries = ["example.invalid/team/image", "mirror.invalid/team/image"]

// These tests exercise the real Bash script and real release policy. Every
// Docker, git, and GitHub CLI call is intercepted; no daemon, credentials,
// network access, real archives, or remote publication is involved. Unexpected
// commands fail the test instead of falling through to a real executable.
function mockCli() {
  const fs = require("node:fs")
  const path = require("node:path")
  const directory = process.env.MOCK_DIRECTORY
  const config = JSON.parse(fs.readFileSync(path.join(directory, "config.json"), "utf8"))
  const statePath = path.join(directory, "state.json")
  const state = JSON.parse(fs.readFileSync(statePath, "utf8"))
  const tool = path.basename(process.argv[1])
  const args = process.argv.slice(2)
  fs.appendFileSync(path.join(directory, "calls.jsonl"), `${JSON.stringify({ tool, args })}\n`)
  function finish(output = "", status = 0) {
    fs.writeFileSync(statePath, JSON.stringify(state))
    if (output) (status ? process.stderr : process.stdout).write(`${output}\n`)
    process.exit(status)
  }
  function unexpected() {
    finish(`Unexpected mock command: ${tool} ${JSON.stringify(args)}`, 99)
  }
  if (tool === "git") {
    if (args.join(" ") === "rev-parse HEAD") finish(config.checkout || config.commit)
    if (args.join(" ") === "fetch origin --tags") finish("", config.fetchFailure ? 1 : 0)
    if (args.join(" ") === "tag --list v*") finish(config.gitTags.join("\n"))
    unexpected()
  }
  if (tool === "gh") {
    if (args[0] !== "release" || !["create", "edit"].includes(args[1])) unexpected()
    if (args[1] === "create") {
      const notes = args[args.indexOf("--notes-file") + 1]
      fs.writeFileSync(path.join(directory, "release-notes"), fs.readFileSync(notes))
      if (config.releaseFailure) finish("GitHub release creation failed", 1)
    }
    finish()
  }
  if (tool !== "docker") unexpected()
  if (args[0] === "load" && args[1] === "-i") {
    const arch = path.basename(args[2]).split(".")[0]
    if (!config.ids[arch] || !fs.existsSync(args[2])) finish("Missing image archive", 1)
    state.loaded.push(arch)
    state.current = arch
    finish("Loaded image: nezha-validation:latest")
  }
  if (args[0] === "image" && args[1] === "inspect") {
    const reference = args[2]
    const format = args[4]
    if (reference.endsWith(":latest")) {
      if (format.includes("org.opencontainers.image.version") && config.latest[reference]) {
        finish(config.latest[reference])
      }
      unexpected()
    }
    const arch =
      reference === "nezha-validation"
        ? state.current
        : Object.keys(config.ids).find((name) => config.ids[name] === reference)
    if (!state.loaded.includes(arch)) finish("Image not loaded", 1)
    if (format === "{{.Id}}") {
      finish(config.idMismatch === arch ? `sha256:${"0".repeat(64)}` : config.ids[arch])
    }
    if (format === "{{.Architecture}}") finish(config.archMismatch === arch ? "riscv64" : arch)
    if (format.includes("org.opencontainers.image.revision")) {
      finish(config.revisionMismatch === arch ? "0".repeat(40) : config.commit)
    }
    if (format.includes("org.opencontainers.image.version")) {
      finish(config.versionMismatch === arch ? "v0.0.0" : config.tag)
    }
    unexpected()
  }
  if (args[0] === "pull") finish()
  if (args[0] === "tag") {
    const arch = Object.keys(config.ids).find((name) => config.ids[name] === args[1])
    if (!state.loaded.includes(arch)) finish("Can only tag a loaded image by its tested ID", 1)
    state.localTags[args[2]] = arch
    finish()
  }
  if (args[0] === "push") {
    const arch = state.localTags[args[1]]
    if (!arch) finish("Can only push a previously tagged tested image", 1)
    state.remoteTags[args[1]] = config.digests[arch]
    finish()
  }
  if (args.slice(0, 3).join(" ") === "buildx imagetools inspect") {
    const reference = args[3]
    if (config.registryError && reference === config.registryError.reference) {
      finish(config.registryError.message, 1)
    }
    let digest = state.remoteTags[reference]
    if (config.immutable.includes(reference) || config.latest[reference])
      digest ||= config.indexDigest
    if (!digest) finish("ERROR: manifest unknown: manifest unknown", 1)
    if (args.includes("--format")) {
      if (config.invalidDigest && reference.includes(":validated-")) digest = "invalid-digest"
      if (config.aliasMismatch && reference.includes(":sha-")) digest = `sha256:${"f".repeat(64)}`
      finish(JSON.stringify({ digest }))
    }
    finish(`Name: ${reference}`)
  }
  if (args.slice(0, 3).join(" ") === "buildx imagetools create") {
    const tags = []
    const sources = []
    for (let i = 3; i < args.length; i++) {
      if (args[i] === "--tag") tags.push(args[++i])
      else sources.push(args[i])
    }
    if (!sources.length || sources.some((source) => !/@sha256:[0-9a-f]{64}$/.test(source))) {
      finish("Manifest assembly must use immutable digests", 1)
    }
    for (const tag of tags) state.remoteTags[tag] = config.indexDigest
    finish()
  }
  unexpected()
}

function publication(t, options = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "publish-release-test-"))
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }))
  const config = {
    commit,
    ids,
    digests,
    indexDigest,
    tag: "v3.1.13",
    gitTags: ["v3.1.12", "v3.1.13"],
    immutable: [],
    latest: {},
    ...options,
  }
  for (const folder of ["bin", "scripts", "tested-images"])
    fs.mkdirSync(path.join(directory, folder))
  for (const script of ["publish-release.sh", "release-policy.cjs"]) {
    fs.copyFileSync(path.join(root, "scripts", script), path.join(directory, "scripts", script))
  }
  fs.writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify({ version: config.tag.slice(1) }),
  )
  fs.writeFileSync(path.join(directory, "config.json"), JSON.stringify(config))
  fs.writeFileSync(
    path.join(directory, "state.json"),
    JSON.stringify({ loaded: [], localTags: {}, remoteTags: {} }),
  )
  fs.writeFileSync(path.join(directory, "calls.jsonl"), "")
  for (const tool of ["docker", "git", "gh"]) {
    fs.writeFileSync(
      path.join(directory, "bin", tool),
      `#!${process.execPath}\n(${mockCli.toString()})()\n`,
      { mode: 0o755 },
    )
  }
  for (const arch of ["amd64", "arm64"]) {
    fs.writeFileSync(path.join(directory, "tested-images", `${arch}.id`), `${ids[arch]}\n`)
    fs.writeFileSync(
      path.join(directory, "tested-images", `${arch}.tar.gz`),
      "mocked docker archive",
    )
  }
  if (config.missingArchive)
    fs.unlinkSync(path.join(directory, "tested-images", `${config.missingArchive}.tar.gz`))
  const summary = path.join(directory, "summary")
  const result = spawnSync("bash", ["scripts/publish-release.sh", "tested-images"], {
    cwd: directory,
    env: {
      ...process.env,
      PATH: `${path.join(directory, "bin")}${path.delimiter}${process.env.PATH}`,
      MOCK_DIRECTORY: directory,
      RELEASE_TAG: config.tag,
      COMMIT_SHA: commit,
      REGISTRY_IMAGE: registries[0],
      ALIYUN_REGISTRY_IMAGE: registries[1],
      GITHUB_RUN_ID: "1234",
      GITHUB_RUN_ATTEMPT: "2",
      GITHUB_REPOSITORY: "example/repository",
      GITHUB_STEP_SUMMARY: summary,
      GH_TOKEN: "not-a-real-token",
    },
    encoding: "utf8",
    timeout: 30_000,
  })
  assert.ifError(result.error)
  const calls = fs
    .readFileSync(path.join(directory, "calls.jsonl"), "utf8")
    .trim()
    .split("\n")
    .filter(Boolean)
    .map(JSON.parse)
  const read = (name) =>
    fs.existsSync(path.join(directory, name))
      ? fs.readFileSync(path.join(directory, name), "utf8")
      : ""
  return { ...result, calls, summary: read("summary"), notes: read("release-notes") }
}

function writes(result) {
  return result.calls.filter(
    ({ tool, args }) =>
      tool === "gh" ||
      (tool === "docker" &&
        (args[0] === "push" || args.slice(0, 3).join(" ") === "buildx imagetools create")),
  )
}
function assertFailedBeforeWrites(result) {
  assert.notEqual(result.status, 0, result.stdout)
  assert.deepEqual(writes(result), [], result.stderr)
  assert.doesNotMatch(result.stderr, /Unexpected mock command/)
}
function creates(result) {
  return result.calls.filter(
    ({ tool, args }) =>
      tool === "docker" && args.slice(0, 3).join(" ") === "buildx imagetools create",
  )
}
function assertNoLatest(result) {
  assert.equal(result.status, 0, result.stderr)
  assert.equal(
    creates(result).some(({ args }) => args.some((arg) => arg.endsWith(":latest"))),
    false,
  )
  assert.equal(
    result.calls.some(({ tool, args }) => tool === "gh" && args[1] === "edit"),
    false,
  )
  assert.match(result.summary, /Latest promoted: false/)
}

for (const mismatch of ["idMismatch", "archMismatch", "revisionMismatch", "versionMismatch"]) {
  test(`${mismatch} in the second native artifact stops before any remote write`, (t) => {
    const result = publication(t, { [mismatch]: "arm64" })
    assertFailedBeforeWrites(result)
    assert.equal(result.calls.filter(({ args }) => args[0] === "load").length, 2)
  })
}
test("a missing second archive stops before any remote write", (t) => {
  assertFailedBeforeWrites(publication(t, { missingArchive: "arm64" }))
})
test("a checkout mismatch stops before fetching or touching Docker", (t) => {
  const result = publication(t, { checkout: "0".repeat(40) })
  assertFailedBeforeWrites(result)
  assert.deepEqual(result.calls, [{ tool: "git", args: ["rev-parse", "HEAD"] }])
})
for (const registry of registries) {
  for (const tag of ["v3.1.13", `sha-${commit}`]) {
    test(`existing immutable ${registry}:${tag} stops publication`, (t) => {
      const result = publication(t, { immutable: [`${registry}:${tag}`] })
      assertFailedBeforeWrites(result)
      assert.match(result.stderr, /Refusing to overwrite immutable/)
    })
  }
}
for (const message of [
  "unauthorized: authentication required",
  "dial tcp: connection refused",
  "toomanyrequests: retry later",
]) {
  test(`registry failure fails closed: ${message}`, (t) => {
    const result = publication(t, {
      registryError: { reference: `${registries[1]}:v3.1.13`, message },
    })
    assertFailedBeforeWrites(result)
    assert.ok(result.stderr.includes(message))
  })
}
test("a failed tag refresh stops publication", (t) => {
  assertFailedBeforeWrites(publication(t, { fetchFailure: true }))
})
test("an unparseable existing latest label fails closed", (t) => {
  assertFailedBeforeWrites(publication(t, { latest: { [`${registries[0]}:latest`]: "unknown" } }))
})
test("a prerelease is published without promoting either registry or GitHub latest", (t) => {
  const result = publication(t, { tag: "v3.2.0-rc.1" })
  assertNoLatest(result)
  const release = result.calls.find(({ tool, args }) => tool === "gh" && args[1] === "create")
  assert.ok(release.args.includes("--prerelease"))
  assert.ok(release.args.includes("--latest=false"))
  assert.equal(creates(result).length, 2)
})
test("a newer stable git tag prevents an old stable release from promoting latest", (t) => {
  assertNoLatest(publication(t, { gitTags: ["v3.1.13", "v3.1.14"] }))
})
test("a newer latest label in either registry prevents rollback even if absent from git", (t) => {
  assertNoLatest(publication(t, { latest: { [`${registries[1]}:latest`]: "v4.0.0" } }))
})
test("the newest stable release publishes both tested IDs and assembles only by digest, without rebuilding", (t) => {
  const result = publication(t)
  assert.equal(result.status, 0, result.stderr)
  const loads = result.calls
    .map((call, i) => (call.args[0] === "load" ? i : -1))
    .filter((i) => i >= 0)
  const firstPush = result.calls.findIndex(({ args }) => args[0] === "push")
  assert.equal(loads.length, 2)
  assert.ok(loads.every((i) => i < firstPush))
  assert.equal(
    result.calls.some(({ tool, args }) => tool === "docker" && args.includes("build")),
    false,
  )
  assert.equal(result.calls.filter(({ args }) => args[0] === "push").length, 4)
  for (const registry of registries) {
    for (const arch of ["amd64", "arm64"]) {
      assert.ok(
        result.calls.some(
          ({ tool, args }) =>
            tool === "docker" &&
            JSON.stringify(args) ===
              JSON.stringify(["tag", ids[arch], `${registry}:validated-1234-2-${arch}`]),
        ),
      )
    }
    const manifest = creates(result).find(({ args }) => args.includes(`${registry}:v3.1.13`))
    assert.deepEqual(manifest.args, [
      "buildx",
      "imagetools",
      "create",
      "--tag",
      `${registry}:v3.1.13`,
      "--tag",
      `${registry}:sha-${commit}`,
      `${registry}@${digests.amd64}`,
      `${registry}@${digests.arm64}`,
    ])
    const latest = creates(result).find(({ args }) => args.includes(`${registry}:latest`))
    assert.deepEqual(latest.args, [
      "buildx",
      "imagetools",
      "create",
      "--tag",
      `${registry}:latest`,
      `${registry}@${indexDigest}`,
    ])
    assert.ok(result.notes.includes(`${registry}@${indexDigest}`))
  }
  const releaseIndex = result.calls.findIndex(
    ({ tool, args }) => tool === "gh" && args[1] === "create",
  )
  const release = result.calls[releaseIndex]
  const immutableIndexes = result.calls
    .map(({ tool, args }, i) =>
      tool === "docker" &&
      args.slice(0, 3).join(" ") === "buildx imagetools create" &&
      args.includes("--tag") &&
      !args.some((arg) => arg.endsWith(":latest"))
        ? i
        : -1,
    )
    .filter((i) => i >= 0)
  assert.equal(immutableIndexes.length, 2)
  assert.ok(immutableIndexes.every((i) => i < releaseIndex))
  for (const flag of ["--verify-tag", "--generate-notes", "--latest=false"])
    assert.ok(release.args.includes(flag))
  assert.equal(release.args.includes("--prerelease"), false)
  const last = result.calls.at(-1)
  assert.deepEqual(last, {
    tool: "gh",
    args: ["release", "edit", "v3.1.13", "--repo", "example/repository", "--latest"],
  })
  assert.match(result.summary, /Latest promoted: true/)
})
test("an invalid pushed digest never reaches manifest assembly or GitHub", (t) => {
  const result = publication(t, { invalidDigest: true })
  assert.notEqual(result.status, 0)
  assert.equal(creates(result).length, 0)
  assert.equal(
    result.calls.some(({ tool }) => tool === "gh"),
    false,
  )
})
test("a mismatched immutable alias digest stops before creating the GitHub release", (t) => {
  const result = publication(t, { aliasMismatch: true })
  assert.notEqual(result.status, 0)
  assert.equal(
    result.calls.some(({ tool }) => tool === "gh"),
    false,
  )
  assert.equal(creates(result).length, 1)
})
test("GitHub release failure never promotes registry or GitHub latest", (t) => {
  const result = publication(t, { releaseFailure: true })
  assert.notEqual(result.status, 0)
  assert.equal(creates(result).length, 2)
  assert.equal(
    result.calls.some(({ tool, args }) => tool === "gh" && args[1] === "edit"),
    false,
  )
})

test("publication is tag-gated, serialized, protected, and consumes validation artifacts without a rebuild", () => {
  const workflow = fs.readFileSync(path.join(root, ".github/workflows/Deploy.yml"), "utf8")
  assert.match(workflow, /push:\s*\n\s+tags: \["v\*"\]/)
  assert.match(
    workflow,
    /validate:\s*\n\s+uses: \.\/\.github\/workflows\/container-validation\.yml/,
  )
  const publish = workflow.slice(workflow.indexOf("  publish:"))
  for (const expected of [
    "needs: validate",
    "environment: Production",
    "group: release-publication",
    "cancel-in-progress: false",
    "actions/download-artifact@",
    "pattern: tested-image-*",
    "merge-multiple: true",
    "bash scripts/publish-release.sh tested-images",
  ]) {
    assert.ok(publish.includes(expected), `Missing publication guard: ${expected}`)
  }
  assert.doesNotMatch(publish, /build-push-action|docker\s+(?:build|buildx\s+build)|pnpm\s+build/)
})
test("validation tests native architectures before uploading artifacts and has no publication secrets", () => {
  const workflow = fs.readFileSync(
    path.join(root, ".github/workflows/container-validation.yml"),
    "utf8",
  )
  assert.match(workflow, /arch: amd64\s*\n\s+runner: ubuntu-latest/)
  assert.match(workflow, /arch: arm64\s*\n\s+runner: ubuntu-24\.04-arm/)
  assert.match(workflow, /platforms: linux\/\$\{\{ matrix\.arch \}\}/)
  assert.match(workflow, /load: true/)
  assert.match(workflow, /docker save nezha-validation \| gzip/)
  assert.match(workflow, /node --test scripts\/\*\.test\.cjs/)
  assert.doesNotMatch(workflow, /secrets\.|push: true|login-action|contents: write|packages: write/)
  const save = workflow.indexOf("- name: Save tested image")
  for (const verifier of ["node scripts/verify-container.cjs", "node scripts/verify-pwa.cjs"]) {
    assert.ok(
      workflow.indexOf(verifier) >= 0 && workflow.indexOf(verifier) < save,
      `${verifier} must run before image export`,
    )
  }
  assert.ok(save < workflow.indexOf("uses: actions/upload-artifact@"))
  assert.doesNotMatch(workflow, /if: inputs.upload-images/)
  assert.match(workflow, /archive-check:[\s\S]*needs: container/)
  assert.match(workflow, /docker load -i "tested-images\/\$arch.tar.gz"/)
  assert.match(workflow, /actions\/download-artifact@/)
})
