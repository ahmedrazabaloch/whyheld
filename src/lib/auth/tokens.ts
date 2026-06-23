import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/db";

/**
 * Token utilities backed by the `VerificationToken` table.
 *
 * Tokens are namespaced by `identifier` so a single table serves both email
 * verification and password resets:
 *   - "verify-email:<email>"
 *   - "reset-password:<email>"
 *
 * Only a SHA-256 hash of the token is stored; the raw token is returned once
 * (to embed in a link) and never persisted in plaintext.
 */

export type TokenPurpose = "verify-email" | "reset-password";

const TTL_MINUTES: Record<TokenPurpose, number> = {
  "verify-email": 60 * 24, // 24 hours
  "reset-password": 60, // 1 hour
};

function identifierFor(purpose: TokenPurpose, email: string): string {
  return `${purpose}:${email.toLowerCase()}`;
}

function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Create a fresh token for a purpose+email, invalidating any prior tokens for
 * that identifier. Returns the RAW token (to be emailed); only the hash is
 * stored.
 */
export async function createToken(
  purpose: TokenPurpose,
  email: string,
): Promise<string> {
  const identifier = identifierFor(purpose, email);
  const rawToken = randomBytes(32).toString("hex");
  const token = hashToken(rawToken);
  const expires = new Date(Date.now() + TTL_MINUTES[purpose] * 60 * 1000);

  // Invalidate prior tokens for this identifier, then store the new hash.
  await prisma.$transaction([
    prisma.verificationToken.deleteMany({ where: { identifier } }),
    prisma.verificationToken.create({
      data: { identifier, token, expires },
    }),
  ]);

  return rawToken;
}

/**
 * Validate and CONSUME a raw token. Returns the email on success, or null if
 * the token is invalid/expired. Single-use: the row is deleted on success.
 */
export async function consumeToken(
  purpose: TokenPurpose,
  rawToken: string,
): Promise<string | null> {
  const token = hashToken(rawToken);
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) return null;

  const prefix = `${purpose}:`;
  if (!record.identifier.startsWith(prefix)) return null;

  // Always delete the row (single-use), even if expired.
  await prisma.verificationToken.delete({ where: { token } });

  if (record.expires.getTime() < Date.now()) return null;

  return record.identifier.slice(prefix.length);
}
