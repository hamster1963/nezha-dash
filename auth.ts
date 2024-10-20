import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        password: {},
      },
      authorize: async (credentials) => {
        if (credentials.password === "123456") {
          return { id: "1", name: "John Doe" }
        }
        return null
      },
    }),
  ],
})