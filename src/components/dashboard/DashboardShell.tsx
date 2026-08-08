"use client";

import type { ReactNode } from "react";
import type { User } from "next-auth";
import { Sidebar, MobileHeader } from "@/components/dashboard";
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav";

/**
 * App-shell wrapper that provides the persistent sidebar (desktop) and
 * mobile chrome to every authenticated app route. Each route's layout.tsx
 * renders its children inside this component.
 */
export function DashboardShell({ children, user }: { children: ReactNode; user?: User }) {
  return (
    <div className="min-h-svh bg-brand-bg">
      <Sidebar user={user} />
      <MobileHeader user={user} />

      {/* Main content — offset by sidebar on lg; bottom pad for mobile nav */}
      <main className="pb-28 lg:pb-0 lg:pl-60">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>

      <DashboardMobileNav />
    </div>
  );
}
