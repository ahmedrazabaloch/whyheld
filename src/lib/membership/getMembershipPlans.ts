import { prisma } from "@/lib/db";
import { PLANS as DEFAULT_PLANS, type Plan } from "@/components/sections/membership.config";

/**
 * Reusable membership service.
 * Loads plans from the database.
 * Falls back to default config plans if the table is empty.
 * Maps the database rows cleanly into the front-end Plan objects.
 */
export async function getMembershipPlans(): Promise<Plan[]> {
  try {
    const dbPlans = await prisma.membershipPlan.findMany({
      orderBy: { priceAmount: "asc" },
    });

    if (!dbPlans || dbPlans.length === 0) {
      return DEFAULT_PLANS;
    }

    // Sort to match typical tier presentation: FREE, PER_JOURNEY, PREMIUM
    return DEFAULT_PLANS.map((defaultPlan) => {
      // Find the corresponding plan from the database by Tier enum
      // config id is "free", "journey", "premium"
      let tierEnum = "";
      if (defaultPlan.id === "free") tierEnum = "FREE";
      if (defaultPlan.id === "journey") tierEnum = "PER_JOURNEY";
      if (defaultPlan.id === "premium") tierEnum = "PREMIUM";

      const dbPlan = dbPlans.find((p) => p.tier === tierEnum);
      
      if (!dbPlan) {
        return defaultPlan;
      }

      let formattedPrice = "Free";
      if (dbPlan.priceAmount != null && dbPlan.priceAmount > 0) {
        formattedPrice = `$${(dbPlan.priceAmount / 100).toFixed(2)}`;
      }

      return {
        ...defaultPlan,
        price: formattedPrice,
      };
    });
  } catch (error) {
    // Graceful fallback to config on database errors
    console.error("Failed to load membership plans from database:", error);
    return DEFAULT_PLANS;
  }
}
