import { createHash, timingSafeEqual } from "node:crypto"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import getEnv from "@/lib/env-entry"

function safeEqual(a: string, b: string): boolean {
  try {
    const bufA = Buffer.isBuffer(a) ? a : Buffer.from(a)
    const bufB = Buffer.isBuffer(b) ? b : Buffer.from(b)

    const hashA = createHash("sha256").update(bufA).digest()
    const hashB = createHash("sha256").update(bufB).digest()

    return timingSafeEqual(hashA, hashB)
  } catch (_err) {
    return false
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret:
    process.env.AUTH_SECRET ??
    createHash("sha256")
      .update(`this_is_nezha_dash_web_secret_${getEnv("SitePassword")}`)
      .digest("hex"),
  trustHost: process.env.AUTH_TRUST_HOST ? process.env.AUTH_TRUST_HOST === "true" : true,
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: { password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const password = typeof credentials?.password === "string" ? credentials.password : ""

        const sitePassword = getEnv("SitePassword")
        if (sitePassword && safeEqual(password, sitePassword)) {
          return { id: "nezha-dash-auth" }
        }

        return null
      },
    }),
  ],
})
