import { env } from "next-runtime-env";

export default function getEnv(key: string) {
  if (process.env.VERCEL || process.env.CF_PAGES) {
    return process.env[key];
  } else {
    if (key.startsWith("NEXT_PUBLIC_")) {
      return env(key);
    }
    return process.env[key];
  }
}
