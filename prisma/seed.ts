import { PrismaClient, PlanTier } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding membership plans...");

  const plans = [
    {
      tier: PlanTier.FREE,
      name: "Free",
      priceAmount: 0,
      priceCurrency: "usd",
      stripeProductId: null,
      stripePriceId: null,
      isActive: true,
      features: [
        "1 Generated Journey",
        "Community itineraries",
        "Standard support",
      ],
    },
    {
      tier: PlanTier.PER_JOURNEY,
      name: "Per Journey",
      priceAmount: 2999, // $29.99
      priceCurrency: "usd",
      stripeProductId: null,
      stripePriceId: null,
      isActive: true,
      features: [
        "Everything in Free",
        "1 Premium Journey Generation",
        "High-priority generation queue",
        "Email support",
      ],
    },
    {
      tier: PlanTier.PREMIUM,
      name: "Premium",
      priceAmount: 999, // $9.99
      priceCurrency: "usd",
      stripeProductId: null,
      stripePriceId: null,
      isActive: true,
      features: [
        "Unlimited Generated Journeys",
        "Access to hidden local gems",
        "VIP generation speed",
        "24/7 dedicated support",
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.membershipPlan.upsert({
      where: { tier: plan.tier },
      update: plan,
      create: plan,
    });
  }

  console.log("Membership plans seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
