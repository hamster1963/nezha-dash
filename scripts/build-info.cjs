const { execFileSync } = require("node:child_process")
const { resolve } = require("node:path")
const { version: packageVersion } = require("../package.json")
const { validateTag } = require("./release-policy.cjs")

const REPOSITORY_URL = "https://github.com/hamster1963/nezha-dash"

function readGitSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: resolve(__dirname, ".."),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
  } catch {
    // Source archives and Docker build contexts do not need a .git directory.
    return ""
  }
}

function validSha(value) {
  return typeof value === "string" && /^[0-9a-f]{7,64}$/i.exec(value)?.[0] === value
}

function getBuildInfo({ version = packageVersion, env = process.env, gitSha = readGitSha } = {}) {
  // A package version alone is never evidence that a release exists.
  if (env.RELEASE_TAG) {
    if (!validateTag(version, env.RELEASE_TAG)) {
      throw new Error(
        `RELEASE_TAG must be the valid release tag v${version}; received ${JSON.stringify(env.RELEASE_TAG)}`,
      )
    }
    return {
      version,
      label: env.RELEASE_TAG,
      url: `${REPOSITORY_URL}/releases/tag/${env.RELEASE_TAG}`,
    }
  }

  const candidateSha = validSha(env.COMMIT_SHA) ? env.COMMIT_SHA : gitSha()
  const sha = validSha(candidateSha) ? candidateSha.toLowerCase() : ""
  return {
    version,
    label: `v${version}-dev.${sha ? sha.slice(0, 7) : "local"}`,
    url: sha ? `${REPOSITORY_URL}/commit/${sha}` : REPOSITORY_URL,
  }
}

module.exports = { getBuildInfo }
