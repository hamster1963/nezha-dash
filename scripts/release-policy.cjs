const { readFileSync } = require("node:fs")

// Release versions must also be valid Docker tags, so SemVer build metadata (+)
// is deliberately unsupported. Keep numeric components as strings: SemVer does
// not impose JavaScript's Number.MAX_SAFE_INTEGER limit.
const VERSION =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/

function parseTag(tag) {
  if (typeof tag !== "string" || !tag.startsWith("v") || tag.length > 128) return null
  const match = VERSION.exec(tag.slice(1))
  if (!match || match[0] !== tag.slice(1)) return null
  const prerelease = match[4]
  if (prerelease?.split(".").some((part) => /^0\d+$/.test(part))) return null
  return { core: match.slice(1, 4), prerelease }
}

function validateTag(version, tag) {
  return typeof version === "string" && tag === `v${version}` && parseTag(tag) !== null
}

function compareNumberStrings(left, right) {
  if (left.length !== right.length) return left.length > right.length ? 1 : -1
  if (left === right) return 0
  return left > right ? 1 : -1
}

function compareStable(left, right) {
  for (let index = 0; index < 3; index++) {
    const result = compareNumberStrings(left.core[index], right.core[index])
    if (result !== 0) return result
  }
  return 0
}

function canPromoteLatest(candidateTag, existingTags) {
  const candidate = parseTag(candidateTag)
  if (!candidate || candidate.prerelease) return false
  return existingTags.every((tag) => {
    const existing = parseTag(tag)
    // The pushed candidate is already present in git. Equality permits that
    // tag and idempotent retries; publication separately enforces immutability.
    return !existing || existing.prerelease || compareStable(candidate, existing) >= 0
  })
}

module.exports = { validateTag, canPromoteLatest }

if (require.main === module) {
  const [command, tag, ...extra] = process.argv.slice(2)
  try {
    if (!tag || extra.length || !["check", "latest"].includes(command)) {
      throw new Error("Usage: node scripts/release-policy.cjs <check|latest> <tag>")
    }
    if (command === "check") {
      const { version } = require("../package.json")
      if (!validateTag(version, tag)) {
        throw new Error(
          `Release tag must be v${version}, strict SemVer without build metadata, and at most 128 characters; received ${JSON.stringify(tag)}`,
        )
      }
      console.log(`Validated ${tag}`)
    } else {
      const tags = readFileSync(0, "utf8").split(/\r?\n/).filter(Boolean)
      console.log(canPromoteLatest(tag, tags))
    }
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
