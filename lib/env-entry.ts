import { env } from "next-runtime-env"

export default function getEnv(key: string) {
  if (key.startsWith("NEXT_PUBLIC_")) {
    return env(key)
  }
  return process.env[key]
}
