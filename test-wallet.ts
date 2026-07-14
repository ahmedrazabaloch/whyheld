import { PrismaClient } from '@prisma/client';
import { ensureUserWallet } from './src/lib/auth/provisioning';

const prisma = new PrismaClient();

async function test() {
  const email = `test-${Date.now()}@example.com`;
  
  const dbUser = await prisma.user.upsert({
    where: { email },
    update: { emailVerified: new Date() },
    create: {
      email,
      emailVerified: new Date(),
    },
  });

  console.log("User created:", dbUser.id);

  await ensureUserWallet(dbUser.id);

  const wallet = await prisma.creditWallet.findUnique({
    where: { userId: dbUser.id },
  });

  console.log("Wallet after ensureUserWallet:", wallet);
}

test().catch(console.error).finally(() => prisma.$disconnect());
