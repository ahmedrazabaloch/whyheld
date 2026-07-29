import { prisma } from "@/lib/db";

async function test() {
  await prisma.user.create({
    data: {
      email: "test@example.com",
      passwordHash: "hash",
      profile: {
        create: { firstName: "Test" }
      },
      creditWallet: {
        create: {
          balance: 5,
          lifetimeGranted: 5,
          transactions: {
            create: {
              type: "GRANT",
              amount: 5,
              balanceAfter: 5,
              reason: "SIGNUP_BONUS",
            }
          }
        }
      }
    }
  });
}
