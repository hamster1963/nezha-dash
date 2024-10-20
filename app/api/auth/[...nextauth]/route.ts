import { handlers } from "@/auth";

export const runtime = "edge";

// Referring to the auth.ts we just created
export const { GET, POST } = handlers;
