import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import getEnv from "./lib/env-entry";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: "this_is_nezha_dash_web_secret",
  providers: [
    Credentials({
      credentials: {
        password: {},
      },
      authorize: async (credentials) => {
        if (credentials.password === getEnv("Site_Password")) {
          return { id: "0" };
        }
        return null;
      },
    }),
  ],
});
