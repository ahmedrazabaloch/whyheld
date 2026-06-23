import { Hero, Navbar } from "@/components/hero";
import {
  FeaturedJourneys,
  FinalCta,
  HowWayheldThinks,
  Membership,
  SiteFooter,
  WhyTravelBroken,
  ScrollToTop,
} from "@/components/sections";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <Navbar />
      <Hero />
      <WhyTravelBroken />
      <HowWayheldThinks />
      <FeaturedJourneys />
      <Membership />
      <FinalCta />
      <SiteFooter />
      <ScrollToTop />
    </main>
  );
}
