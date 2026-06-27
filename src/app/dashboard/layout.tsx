import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard";
import { auth } from "@/lib/auth/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/start");
  }

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
