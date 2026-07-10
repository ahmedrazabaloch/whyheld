import { Hero } from "@/components/hero";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import {
  FeaturedJourneys,
  FinalCta,
  HowWayheldThinks,
  Membership,
  WhyTravelBroken,
  StatisticsSection,
  ProcessSection,
} from "@/components/sections";

import { auth } from "@/lib/auth/auth";
import { getMembershipPlans } from "@/lib/membership/getMembershipPlans";

export default async function Home() {
  const [plans, session] = await Promise.all([
    getMembershipPlans(),
    auth(),
  ]);
  const isAuthenticated = !!session?.user?.id;

  return (
    <MarketingLayout>
      <main className="flex flex-1 flex-col">
        <Hero />
        <StatisticsSection />
        <ProcessSection />
        <WhyTravelBroken />
        <HowWayheldThinks />
        <FeaturedJourneys />
        <Membership plans={plans} isAuthenticated={isAuthenticated} />
        <FinalCta />
      </main>
    </MarketingLayout>
  );
}
