import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard";
import { getCachedSession, getCachedProfile } from "@/lib/auth/session-cache";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getCachedSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Kick off the profile fetch immediately so the React cache promise is created
  // before any child page calls getCachedProfile(). The layout does NOT await it:
  // Sidebar and MobileHeader accept the user prop but do not render firstName,
  // so there is nothing to block on here. Pages that need profile data (dashboard,
  // settings, profile) will await the same already-in-flight React cache promise.
  void getCachedProfile(session.user.id);

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
