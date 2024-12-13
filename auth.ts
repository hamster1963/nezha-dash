import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

import getEnv from "./lib/env-entry"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "this_is_nezha_dash_web_secret",
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
