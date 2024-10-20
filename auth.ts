import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import getEnv from "./lib/env-entry";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: "this_is_nezha_dash_web_secret",
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        password: {},
      },
      authorize: async (credentials) => {
        if (credentials.password === getEnv("SitePassword")) {
          return { id: "0" };
        }
        return null;
      },
    }),
  ],
});
