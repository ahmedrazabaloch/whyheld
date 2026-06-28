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

export default function Home() {
  return (
    <MarketingLayout>
      <main className="flex flex-1 flex-col">
        <Hero />
        <StatisticsSection />
        <ProcessSection />
        <WhyTravelBroken />
        <HowWayheldThinks />
        <FeaturedJourneys />
        <Membership />
        <FinalCta />
      </main>
    </MarketingLayout>
  );
}
