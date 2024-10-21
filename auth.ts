import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import getEnv from "./lib/env-entry";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "this_is_nezha_dash_web_secret",
  trustHost: process.env.AUTH_TRUST_HOST as boolean | undefined ?? true,
  pages: {
    signIn: "/",
  },
  providers: [
    Credentials({
      credentials: { password: { label: "Password", type: "password" } },
      authorize: async (credentials) => {
        if (credentials.password === getEnv("SitePassword")) {
          return { id: "nezha-dash-auth" };
        }
        return null;
      },
    }),
  ],
});
