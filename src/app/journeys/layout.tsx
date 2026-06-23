import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard";

export default function JourneysLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
