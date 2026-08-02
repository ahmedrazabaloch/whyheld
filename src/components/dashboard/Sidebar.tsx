"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";
import { DASHBOARD_NAV_ITEMS } from "./nav";

function isNavActive(pathname: string, href: string) {
  return (
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(`${href}/`))
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar component                                                   */
/* ------------------------------------------------------------------ */

export function Sidebar({}: { user?: User }) {
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
          {DASHBOARD_NAV_ITEMS.map(({ label, href, Icon }) => {
            const active = isNavActive(pathname, href);

            return (
              <Link
                key={href}
                href={href}
                prefetch={false}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[#74876B] text-[#F4EFE6]"
                    : "text-[rgba(244,239,230,0.82)] hover:bg-[rgba(244,239,230,0.08)] hover:text-[#F4EFE6]",
                ].join(" ")}
              >
                <span className="flex-shrink-0 transition-colors duration-200 text-inherit">
                  <Icon />
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
            type="button"
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
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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

export function MobileHeader({}: { user?: User }) {
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
        {DASHBOARD_NAV_ITEMS.map(({ label, href, Icon }) => {
          const active = isNavActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className={[
                "flex items-center justify-center rounded-lg p-2 transition-colors duration-200",
                active
                  ? "text-[#F4EFE6]"
                  : "text-[rgba(244,239,230,0.82)] hover:bg-[rgba(244,239,230,0.08)] hover:text-[#F4EFE6]",
              ].join(" ")}
              aria-label={label}
              title={label}
            >
              <Icon />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
