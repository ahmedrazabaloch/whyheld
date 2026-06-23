import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard";

export default function SavedLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
