"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:border-r lg:border-brand-border/10 lg:bg-brand-sidebar">
      {/* Brand */}
      <div className="flex h-16 items-center px-6">
        <Link
          href="/dashboard"
          className="font-display text-xl tracking-tight text-brand-bg transition-colors hover:text-brand-btn-primary"
          aria-label="Wayheld home"
        >
          Wayheld
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4" aria-label="Main navigation">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ label, href, icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/dashboard" && pathname.startsWith(href + "/"));

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-brand-bg/10 text-brand-bg"
                      : "text-brand-text-secondary/80 hover:bg-brand-bg/5 hover:text-brand-bg",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex-shrink-0 transition-colors duration-300",
                      isActive
                        ? "text-brand-btn-primary"
                        : "text-brand-text-secondary/50 group-hover:text-brand-text-secondary/80",
                    ].join(" ")}
                  >
                    {icon}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer badge */}
      <div className="border-t border-brand-border/10 px-4 py-4">
        <div className="rounded-xl border border-brand-border/10 bg-brand-bg/5 px-3 py-2.5 text-center">
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-brand-text-secondary/60">
            Free plan
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile header (visible < lg)                                       */
/* ------------------------------------------------------------------ */

export function MobileHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-border/10 bg-brand-sidebar px-4 py-3 lg:hidden">
      <Link
        href="/dashboard"
        className="font-display text-lg tracking-tight text-brand-bg"
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
              className={[
                "flex items-center justify-center rounded-lg p-2 transition-colors duration-300",
                isActive
                  ? "text-brand-btn-primary"
                  : "text-brand-text-secondary/50 hover:text-brand-bg",
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
