
import { handlers } from "@/lib/auth/auth";

/**
 * NextAuth v5 catch-all handler — powers provider sign-in (Google),
 * Credentials session creation, CSRF, callback and sign-out endpoints.
 */
export const { GET, POST } = handlers;
