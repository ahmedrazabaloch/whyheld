import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
