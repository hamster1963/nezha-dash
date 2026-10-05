const assert = require("node:assert/strict")
const { execFileSync } = require("node:child_process")

const browser = process.env.AGENT_BROWSER_BIN || "agent-browser"
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3041"
function command(...args) {
  const output = execFileSync(browser, ["--session", "nezha-pwa-validation", "--json", ...args], {
    encoding: "utf8",
    timeout: 90000,
  })
  const result = JSON.parse(output)
  assert(result.success, JSON.stringify(result))
  return result.data
}
function evaluate(source) {
  return command("eval", source).result
}
try {
  command("open", base)
  command("snapshot", "-i")
  const registration = evaluate(`(async () => {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('SW activation timeout')), 30000))
    ]);
    return { state: registration.active.state, script: registration.active.scriptURL };
  })()`)
  assert.equal(registration.state, "activated")
  assert(registration.script.endsWith("/sw.js"))
  console.log("PASS service worker installed and activated", registration)

  // Revisit after activation so the worker controls and caches this navigation.
  command("reload")
  assert(evaluate("Boolean(navigator.serviceWorker.controller)"))
  assert(evaluate("Boolean(document.querySelector('input[type=password]'))"))
  console.log("PASS worker controls online password-gated page")
  const resources = evaluate(`(async () => {
    const manifest = await (await fetch('/manifest.json')).json();
    return Promise.all(manifest.icons.map(async icon => ({ src: icon.src, ok: (await fetch(icon.src)).ok })));
  })()`)
  assert(resources.every((resource) => resource.ok))
  console.log("PASS browser fetched manifest icons", resources)
  command("set", "offline", "on")
  assert.equal(evaluate("navigator.onLine"), false)
  command("reload")
  assert(evaluate("Boolean(navigator.serviceWorker.controller)"))
  assert(evaluate("Boolean(document.querySelector('input[type=password]'))"))
  command("snapshot", "-i")
  console.log("PASS genuine Chromium offline reload preserves cached password gate")
  command("set", "offline", "off")
  command("reload")
  assert.equal(evaluate("navigator.onLine"), true)
  assert(evaluate("Boolean(document.querySelector('input[type=password]'))"))
  console.log("PASS online recovery preserves password gate")
} finally {
  command("close")
}
