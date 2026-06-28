import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { Navbar } from "@/components/hero";
import { SiteFooter, ScrollToTop } from "@/components/sections";
import { PageTransition } from "./PageTransition";

export async function MarketingLayout({ children }: { children: React.ReactNode }) {
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
    <>
      <Navbar user={userWithName} />
      <PageTransition>{children}</PageTransition>
      <SiteFooter />
      <ScrollToTop />
    </>
  );
}
