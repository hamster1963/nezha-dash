import getEnv from "@/lib/env-entry"

const MIN_MY_NODE_QUERY_INTERVAL = 10_000

export function getClientPollingInterval(fallback: number): number {
  const configured = Number.parseInt(getEnv("NEXT_PUBLIC_NezhaFetchInterval") || "", 10)
  const baseInterval = Number.isFinite(configured) ? configured : fallback
  const isMyNodeQueryMode = getEnv("NEXT_PUBLIC_MyNodeQuery") === "true"

  if (isMyNodeQueryMode) {
    return Math.max(baseInterval, MIN_MY_NODE_QUERY_INTERVAL)
  }

  return baseInterval
}
