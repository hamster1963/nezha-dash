const assert = require("node:assert/strict")

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3041"
const cookies = new Map()
let checks = 0
function check(value, label) {
  assert(value, label)
  checks++
  console.log(`PASS ${label}`)
}
async function request(path, options = {}) {
  const response = await fetch(base + path, {
    ...options,
    redirect: "manual",
    headers: {
      cookie: [...cookies].map(([key, value]) => `${key}=${value}`).join("; "),
      ...options.headers,
    },
  })
  for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(";")[0]
    const index = pair.indexOf("=")
    cookies.set(pair.slice(0, index), pair.slice(index + 1))
  }
  return response
}
function post(path, values) {
  return request(path, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams(values),
  })
}
async function main() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(base)
      if (response.ok) break
    } catch (_error) {
      // Wait for the standalone server to start.
    }
    if (attempt === 59) throw new Error("Container did not become ready")
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  let response = await request("/")
  check(response.status === 200, "container home HTTP 200")
  check((await response.text()).includes('type="password"'), "password gate rendered")
  for (const route of ["server", "health", "driver-info", "detail", "monitor", "server-ip"]) {
    response = await request(`/api/${route}?server_id=1`)
    check(response.status === 401, `anonymous ${route} rejected`)
  }
  response = await request("/manifest.json")
  const manifest = await response.json()
  check(response.ok && manifest.display === "standalone", "PWA manifest served")
  for (const icon of manifest.icons) {
    response = await request(icon.src)
    check(response.ok, `manifest icon ${icon.src} served`)
  }
  response = await request("/sw.js")
  check(response.ok, "service worker served")
  const worker = await response.text()
  const runtime = worker.match(/workbox-[a-z0-9]+/)
  check(Boolean(runtime), "Workbox runtime referenced")
  response = await request(`/${runtime[0]}.js`)
  check(response.ok, "Workbox runtime served")
  response = await request("/api/auth/csrf")
  const { csrfToken } = await response.json()
  response = await post("/api/auth/callback/credentials", {
    csrfToken,
    password: "wrong-password",
    callbackUrl: base,
  })
  check((await response.json()).url.includes("CredentialsSignin"), "wrong password rejected")
  response = await post("/api/auth/callback/credentials", {
    csrfToken,
    password: "local-validation-only",
    callbackUrl: base,
  })
  check(!(await response.json()).url.includes("error="), "correct password accepted")
  response = await request("/api/auth/session")
  check(Boolean((await response.json()).user), "authenticated session created")
  response = await request("/api/server")
  check(response.ok && Array.isArray((await response.json()).result), "fixture server API works")
  response = await request("/api/health")
  check(response.ok && (await response.json()).healthy, "fixture health API works")
  response = await request("/_next/image?url=%2Fandroid-chrome-192x192.png&w=32&q=75", {
    headers: { accept: "image/webp" },
  })
  check(
    response.ok && response.headers.get("content-type").startsWith("image/"),
    "native image optimization works",
  )
  response = await request("/api/auth/csrf")
  await post("/api/auth/signout", {
    csrfToken: (await response.json()).csrfToken,
    callbackUrl: base,
  })
  response = await request("/api/server")
  check(response.status === 401, "sign-out restores API protection")
  console.log(`PASS ${checks} container assertions`)
}
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
