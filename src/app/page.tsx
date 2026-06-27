import { auth } from "@/lib/auth/auth";
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

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex flex-1 flex-col">
      <Navbar user={session?.user} />
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
