import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 configuration.
 *
 * Connection URLs now live here (not in schema.prisma):
 *  - DATABASE_URL         → pooled connection used by the app at runtime
 *  - DIRECT_DATABASE_URL  → direct (non-pooled) connection used for migrations
 *                           on serverless Postgres (Neon / Supabase + PgBouncer)
 *
 * No backend implementation yet — this only wires schema/migration tooling.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Prefer the direct (non-pooled) URL for migrate/introspect; fall back to
    // the pooled URL. Defaults to a placeholder so schema tooling
    // (format/validate/generate) works before any real database is provisioned.
    url:
      process.env.DIRECT_DATABASE_URL ??
      process.env.DATABASE_URL ??
      "postgresql://user:password@localhost:5432/wayheld",
  },
});
