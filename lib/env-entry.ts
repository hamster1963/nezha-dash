import type { EnvKey } from "./env"
import { getClientEnv, getServerEnv } from "./env"

export default function getEnv(key: EnvKey): string | undefined {
  if (key.startsWith("NEXT_PUBLIC_")) {
    const clientKey = key.replace("NEXT_PUBLIC_", "") as any
    return getClientEnv(clientKey)
  }
  return getServerEnv(key as any)
}
