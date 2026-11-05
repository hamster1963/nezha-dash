const assert = require("node:assert/strict")
const { mkdtemp, mkdir, rm, writeFile } = require("node:fs/promises")
const { createRequire } = require("node:module")
const { tmpdir } = require("node:os")
const path = require("node:path")
const test = require("node:test")

// Resolve the actual PWA dependency chain, including pnpm's patched package.
const pwaRequire = createRequire(require.resolve("@ducanh2912/next-pwa"))
const workboxRequire = createRequire(pwaRequire.resolve("workbox-build"))
const rollupRequire = createRequire(workboxRequire.resolve("@rollup/plugin-node-resolve"))
const mergeEntry = rollupRequire.resolve("deepmerge")

for (const entry of [mergeEntry, path.join(path.dirname(mergeEntry), "umd.js")]) {
  const merge = require(entry)
  const format = path.basename(entry)

  test(`${format}: untrusted source cannot replace the result prototype`, () => {
    const source = JSON.parse('{"__proto__":{"admin":true},"enabled":true}')
    for (const target of [{}, Object.create(null), null, false, 0, "placeholder"]) {
      const result = merge(target, source)
      assert.equal(Object.getPrototypeOf(result), Object.prototype)
      assert.equal(result.admin, undefined)
      assert.equal(Object.hasOwn(result, "__proto__"), false)
      assert.equal(result.enabled, true)
    }
  })

  test(`${format}: nested null defaults and target keys cannot poison prototypes`, () => {
    const payload = JSON.parse('{"session":{"__proto__":{"admin":true},"name":"test"}}')
    for (const result of [merge({ session: null }, payload), merge(payload, {})]) {
      assert.equal(Object.getPrototypeOf(result.session), Object.prototype)
      assert.equal(result.session.admin, undefined)
      assert.equal(result.session.name, "test")
    }
    const target = JSON.parse('{"__proto__":{"admin":true},"enabled":true}')
    const result = merge(target, {})
    assert.equal(Object.getPrototypeOf(result), Object.prototype)
    assert.equal(result.admin, undefined)
    assert.equal(result.enabled, true)
    assert.equal({}.admin, undefined)
  })

  test(`${format}: normal configuration, arrays and symbol keys still merge`, () => {
    const symbol = Symbol("option")
    const target = { options: { browser: true }, extensions: [".js"], [symbol]: { first: 1 } }
    const source = {
      options: { preferBuiltins: false },
      extensions: [".ts"],
      [symbol]: { second: 2 },
    }
    const result = merge(target, source)
    assert.deepEqual(result, {
      options: { browser: true, preferBuiltins: false },
      extensions: [".js", ".ts"],
      [symbol]: { first: 1, second: 2 },
    })
    assert.notEqual(result.options, target.options)
    assert.deepEqual(target.extensions, [".js"])
  })
}

test("Workbox precache discovery preserves glob patterns and exclusions", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "nezha-precache-"))
  try {
    await mkdir(path.join(directory, "assets"))
    await mkdir(path.join(directory, "ignored"))
    for (const file of ["app.js", "app.js.map", "assets/style.css", "ignored/private.js"]) {
      await writeFile(path.join(directory, file), "fixture")
    }
    const { getManifest } = pwaRequire("workbox-build")
    const { manifestEntries, warnings } = await getManifest({
      globDirectory: directory,
      globPatterns: ["**/*.{js,css}"],
      globIgnores: ["ignored/**"],
    })
    assert.deepEqual(warnings, [])
    assert.deepEqual(manifestEntries.map((entry) => entry.url).sort(), [
      "app.js",
      "assets/style.css",
    ])
    assert(manifestEntries.every((entry) => typeof entry.revision === "string"))
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
