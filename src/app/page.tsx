import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
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
  
  let userWithName = session?.user;
  if (session?.user?.id) {
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { firstName: true },
    });
    if (profile?.firstName) {
      userWithName = { ...session.user, name: profile.firstName };
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <Navbar user={userWithName} />
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
