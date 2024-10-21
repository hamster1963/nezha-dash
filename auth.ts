import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import getEnv from "./lib/env-entry";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: "this_is_nezha_dash_web_secret",
  trustHost: true,
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
