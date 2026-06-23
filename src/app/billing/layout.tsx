import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard";

export default function BillingLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
