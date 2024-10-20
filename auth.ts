import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import getEnv from "./lib/env-entry";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: "H7Fijn9veJRkbizIwUQEpBAzzhRwkv7/ZoB5sGF5cwm5",
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
