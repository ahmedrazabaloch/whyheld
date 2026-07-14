import { prisma } from "@/lib/db";

/**
 * Ensure a user has a CreditWallet. Idempotent — safe to call on every
 * sign-in / signup. (Business rule: a wallet is provisioned at signup with
 * balance 0; see BUSINESS_FLOW.md §1.)
 */
export async function ensureUserWallet(userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const existing = await tx.creditWallet.findUnique({ where: { userId } });
    if (existing) return;

    const wallet = await tx.creditWallet.create({
      data: { 
        userId, 
        balance: 5,
        lifetimeGranted: 5,
      },
    });

    await tx.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: "GRANT", // Using GRANT as SIGNUP_BONUS is not in the schema enum
        amount: 5,
        balanceAfter: 5,
        reason: "SIGNUP_BONUS"
      }
    });
  });
}
