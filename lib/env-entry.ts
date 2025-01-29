import { getClientEnv, getServerEnv } from "./env"
import type { EnvKey } from "./env"

export default function getEnv(key: EnvKey): string {
  if (key.startsWith("NEXT_PUBLIC_")) {
    const clientKey = key.replace("NEXT_PUBLIC_", "") as any
    return getClientEnv(clientKey)
  }
  return getServerEnv(key as any)
}
