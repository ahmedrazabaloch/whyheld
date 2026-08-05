"use client";

import type { ReactNode } from "react";
import type { User } from "next-auth";
import { Sidebar, MobileHeader } from "@/components/dashboard";

/**
 * App-shell wrapper that provides the persistent sidebar (desktop) and
 * mobile header to every authenticated app route. Each route's layout.tsx
 * renders its children inside this component.
 */
export function DashboardShell({ children, user }: { children: ReactNode; user?: User }) {
  return (
    <div className="min-h-svh bg-brand-bg">
      <Sidebar user={user} />
      <MobileHeader user={user} />

      {/* Main content area — offset by sidebar width on large screens. */}
      <main className="lg:pl-60">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
