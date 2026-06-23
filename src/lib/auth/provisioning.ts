import { prisma } from "@/lib/db";

/**
 * Ensure a user has a CreditWallet. Idempotent — safe to call on every
 * sign-in / signup. (Business rule: a wallet is provisioned at signup with
 * balance 0; see BUSINESS_FLOW.md §1.)
 */
export async function ensureUserWallet(userId: string): Promise<void> {
  await prisma.creditWallet.upsert({
    where: { userId },
    update: {},
    create: { userId, balance: 0 },
  });
}
