import { env } from "next-runtime-env";

export default function getEnv(key: string) {
  if (process.env.VERCEL) {
    return process.env[key];
  } else {
    if (key.startsWith("NEXT_PUBLIC_")) {
      return env(key);
    }
    return process.env[key];
  }
}
