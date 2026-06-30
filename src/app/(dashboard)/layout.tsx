import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard";
import { getCachedSession, getCachedProfile } from "@/lib/auth/session-cache";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getCachedSession();

  if (!session?.user) {
    redirect("/login");
  }

  // getCachedProfile is the FIRST call — executes the DB query.
  // Child pages calling getCachedProfile with the same userId get a free cache hit.
  const profile = await getCachedProfile(session.user.id);

  let userWithName = session.user;
  if (profile?.firstName) {
    userWithName = { ...session.user, name: profile.firstName };
  }

  return <DashboardShell user={userWithName}>{children}</DashboardShell>;
}
