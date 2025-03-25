import getEnv from "@/lib/env-entry"
import bcrypt from "bcrypt"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret:
    process.env.AUTH_SECRET ??
    bcrypt.hashSync(`this_is_nezha_dash_web_secret_${getEnv("SitePassword")}`, 10),
  trustHost: (process.env.AUTH_TRUST_HOST as boolean | undefined) ?? true,
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: { password: { label: "Password", type: "password" } },
      // authorization function
      async authorize(credentials) {
        const { password } = credentials
        if (password === getEnv("SitePassword")) {
          return { id: "nezha-dash-auth" }
        }
        return { error: "Invalid password" }
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // @ts-expect-error user is not null
      if (user.error) {
        return false
      }
      return true
    },
  },
})
