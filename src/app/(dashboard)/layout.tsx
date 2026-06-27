import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  let userWithName = session.user;
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { firstName: true },
  });
  if (profile?.firstName) {
    userWithName = { ...session.user, name: profile.firstName };
  }

  return <DashboardShell user={userWithName}>{children}</DashboardShell>;
}
