import { handlers } from "@/auth" // Referring to the auth.ts we just created

export const runtime = 'edge';

export const { GET, POST } = handlers