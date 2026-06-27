import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

/**
 * NextAuth v5 configuration.
 *
 * Strategy: JWT sessions (required for the Credentials provider and ideal for
 * a future mobile token exchange). We persist users in our own schema — which
 * uses a custom `Account` shape and enum providers — rather than the stock
 * Prisma adapter, so OAuth account linking is handled explicitly in callbacks.
 */

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      onboardingComplete: boolean;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const [{ prisma }, { verifyPassword }, { loginSchema }] =
          await Promise.all([
            import("@/lib/db"),
            import("./password"),
            import("./validation"),
          ]);
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        // No user, OAuth-only account (no password), or deleted/suspended.
        if (!user || !user.passwordHash) return null;
        if (user.status !== "ACTIVE") return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: null,
        };
      },
    }),
  ],
  callbacks: {
    /**
     * For OAuth sign-ins, ensure a User + Account link + CreditWallet exist.
     * Credentials users are created at signup (see /api/v1/auth/signup).
     */
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const [{ prisma }, { ensureUserWallet }] = await Promise.all([
          import("@/lib/db"),
          import("./provisioning"),
        ]);
        const email = user.email?.toLowerCase();
        if (!email) return false;

        const dbUser = await prisma.user.upsert({
          where: { email },
          update: { emailVerified: new Date() },
          create: {
            email,
            emailVerified: new Date(),
            profile: {
              create: {
                firstName:
                  (profile?.given_name as string | undefined) ?? null,
                lastName: (profile?.family_name as string | undefined) ?? null,
                avatarUrl: (profile?.picture as string | undefined) ?? null,
              },
            },
          },
        });

        // Link the Google account if not already linked.
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: "GOOGLE",
              providerAccountId: account.providerAccountId,
            },
          },
          update: {},
          create: {
            userId: dbUser.id,
            provider: "GOOGLE",
            providerAccountId: account.providerAccountId,
            type: account.type,
            accessToken: account.access_token,
            refreshToken: account.refresh_token,
            idToken: account.id_token,
            scope: account.scope,
            tokenType: account.token_type,
            expiresAt: account.expires_at,
          },
        });

        await ensureUserWallet(dbUser.id);
        // Stash our db id so jwt() can use the canonical id.
        user.id = dbUser.id;
      }
      return true;
    },

    /** Enrich the JWT with role + status flags read from our DB. */
    async jwt({ token, user }) {
      if (user?.id) {
        token.uid = user.id;
      }
      const userId = token.uid as string | undefined;
      if (userId) {
        const { prisma } = await import("@/lib/db");
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            role: true,
            emailVerified: true,
            profile: { select: { onboardingCompletedAt: true } },
          },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.emailVerified = dbUser.emailVerified !== null;
          token.onboardingComplete =
            dbUser.profile?.onboardingCompletedAt != null;
        }
      }
      return token;
    },

    /** Expose the enriched fields on the session for the app to consume. */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.role = (token.role as string) ?? "USER";
        session.user.onboardingComplete = Boolean(token.onboardingComplete);
      }
      return session;
    },
  },
});
