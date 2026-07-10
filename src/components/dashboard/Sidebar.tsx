"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";

/* ------------------------------------------------------------------ */
/* Navigation items                                                    */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="5.5" height="5.5" rx="1.5" />
        <rect x="10.5" y="2" width="5.5" height="5.5" rx="1.5" />
        <rect x="2" y="10.5" width="5.5" height="5.5" rx="1.5" />
        <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.5" />
      </svg>
    ),
  },
  {
    label: "Journeys",
    href: "/journeys",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 15.5c3-4 5-8 6-13" />
        <path d="M9 2.5c1 5 3 9 6 13" />
        <circle cx="3" cy="15.5" r="1" />
        <circle cx="15" cy="15.5" r="1" />
        <circle cx="9" cy="2.5" r="1" />
      </svg>
    ),
  },
  {
    label: "Saved",
    href: "/saved",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.5 2.5H4.5a1 1 0 0 0-1 1v12l5.5-3 5.5 3v-12a1 1 0 0 0-1-1z" />
      </svg>
    ),
  },
  {
    label: "Billing",
    href: "/billing",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="14" height="10" rx="2" />
        <path d="M2 8h14" />
        <path d="M5 12h3" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="2.5" />
        <path d="M14.7 11.1a1.2 1.2 0 0 0 .24 1.32l.04.04a1.44 1.44 0 1 1-2.04 2.04l-.04-.04a1.2 1.2 0 0 0-1.32-.24 1.2 1.2 0 0 0-.72 1.08v.12a1.44 1.44 0 1 1-2.88 0v-.06a1.2 1.2 0 0 0-.78-1.08 1.2 1.2 0 0 0-1.32.24l-.04.04a1.44 1.44 0 1 1-2.04-2.04l.04-.04a1.2 1.2 0 0 0 .24-1.32 1.2 1.2 0 0 0-1.08-.72h-.12a1.44 1.44 0 1 1 0-2.88h.06a1.2 1.2 0 0 0 1.08-.78 1.2 1.2 0 0 0-.24-1.32l-.04-.04A1.44 1.44 0 1 1 5.7 3.3l.04.04a1.2 1.2 0 0 0 1.32.24h.06a1.2 1.2 0 0 0 .72-1.08v-.12a1.44 1.44 0 1 1 2.88 0v.06a1.2 1.2 0 0 0 .72 1.08 1.2 1.2 0 0 0 1.32-.24l.04-.04a1.44 1.44 0 1 1 2.04 2.04l-.04.04a1.2 1.2 0 0 0-.24 1.32v.06a1.2 1.2 0 0 0 1.08.72h.12a1.44 1.44 0 0 1 0 2.88h-.06a1.2 1.2 0 0 0-1.08.72z" />
      </svg>
    ),
  },
] as const;

/* ------------------------------------------------------------------ */
/* Sidebar component                                                   */
/* ------------------------------------------------------------------ */

export function Sidebar({ user }: { user?: User }) {
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:border-r lg:border-brand-border/10 lg:bg-brand-sidebar">
      {/* Brand */}
      <div className="flex h-16 items-center px-6">
        <Link
          href="/"
          prefetch={false}
          className="font-display text-xl tracking-tight text-[#F4EFE6] transition-colors hover:text-[#FFFFFF]"
          aria-label="Wayheld home"
        >
          Wayheld
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col justify-between px-3 pt-4 pb-6" aria-label="Main navigation">
        <div className="space-y-1">
          {NAV_ITEMS.map(({ label, href, icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href + "/"));

            return (
              <Link
                key={href}
                href={href}
                prefetch={false}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#74876B] text-[#F4EFE6]"
                    : "text-[rgba(244,239,230,0.82)] hover:bg-[rgba(244,239,230,0.08)] hover:text-[#F4EFE6]",
                ].join(" ")}
              >
                <span className="flex-shrink-0 transition-colors duration-200 text-inherit">
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}
          
          <Link
            href="/profile"
            prefetch={false}
            className={[
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              pathname === "/profile"
                ? "bg-[#74876B] text-[#F4EFE6]"
                : "text-[rgba(244,239,230,0.82)] hover:bg-[rgba(244,239,230,0.08)] hover:text-[#F4EFE6]",
            ].join(" ")}
          >
            <span className="flex-shrink-0 transition-colors duration-200 text-inherit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            Profile
          </Link>
        </div>

        <div className="mt-auto space-y-1">
          <div className="my-3 mx-3 h-px bg-[rgba(244,239,230,0.08)]" aria-hidden />
          <button
            disabled={isSigningOut}
            onClick={async () => {
              if (isSigningOut) return;
              setIsSigningOut(true);
              await signOut({ callbackUrl: "/" });
            }}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[rgba(244,239,230,0.82)] transition-all duration-200 hover:bg-[rgba(244,239,230,0.08)] hover:text-[#F4EFE6] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? (
              <>
                <span className="flex-shrink-0 transition-colors duration-200 text-inherit animate-spin">
                  <svg className="h-4.5 w-4.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                Signing Out...
              </>
            ) : (
              <>
                <span className="flex-shrink-0 transition-colors duration-200 text-inherit">
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 14H3.5A1.5 1.5 0 0 1 2 12.5v-9A1.5 1.5 0 0 1 3.5 2H6" />
                    <path d="M11 11.5 14.5 8 11 4.5" />
                    <path d="M14.5 8H6" />
                  </svg>
                </span>
                Sign Out
              </>
            )}
          </button>
        </div>
      </nav>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile header (visible < lg)                                       */
/* ------------------------------------------------------------------ */

export function MobileHeader({ user }: { user?: User }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-border/10 bg-brand-sidebar px-4 py-3 lg:hidden">
      <Link
        href="/"
        prefetch={false}
        className="font-display text-lg tracking-tight text-[#F4EFE6] transition-colors hover:text-[#FFFFFF]"
        aria-label="Wayheld home"
      >
        Wayheld
      </Link>

      <nav className="flex items-center gap-1" aria-label="Mobile navigation">
        {NAV_ITEMS.map(({ label, href, icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href + "/"));

          return (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className={[
                "flex items-center justify-center rounded-lg p-2 transition-colors duration-200",
                isActive
                  ? "text-[#F4EFE6]"
                  : "text-[rgba(244,239,230,0.82)] hover:bg-[rgba(244,239,230,0.08)] hover:text-[#F4EFE6]",
              ].join(" ")}
              aria-label={label}
              title={label}
            >
              {icon}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
