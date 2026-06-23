import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * In development, Next.js hot-reload can create many client instances and
 * exhaust DB connections. We cache a single client on `globalThis`.
 *
 * NOTE: Prisma 7 requires DATABASE_URL to be set to a valid database before
 * the client can be instantiated. During build, if DATABASE_URL is not set,
 * the client initialization may fail. This is expected — ensure .env is properly
 * configured with a valid PostgreSQL connection string before running dev/build.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
