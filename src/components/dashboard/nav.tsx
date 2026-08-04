import type { ComponentType } from "react";

/**
 * Single source of truth for dashboard navigation labels and routes.
 * Sidebar and MobileHeader must both consume this — never duplicate labels.
 */
export type DashboardNavItem = {
  label: string;
  href: string;
  Icon: ComponentType;
};

function NavIconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="5.5" height="5.5" rx="1.5" />
      <rect x="10.5" y="2" width="5.5" height="5.5" rx="1.5" />
      <rect x="2" y="10.5" width="5.5" height="5.5" rx="1.5" />
      <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.5" />
    </svg>
  );
}

function NavIconJourneys() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 15.5c3-4 5-8 6-13" />
      <path d="M9 2.5c1 5 3 9 6 13" />
      <circle cx="3" cy="15.5" r="1" />
      <circle cx="15" cy="15.5" r="1" />
      <circle cx="9" cy="2.5" r="1" />
    </svg>
  );
}

function NavIconExplore() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="9" r="6.5" />
      <path d="M9 2.5v13" />
      <path d="M2.5 9h13" />
      <path d="M4.2 5.2c1.6 1 3.2 1.5 4.8 1.5s3.2-.5 4.8-1.5" />
      <path d="M4.2 12.8c1.6-1 3.2-1.5 4.8-1.5s3.2.5 4.8 1.5" />
    </svg>
  );
}

function NavIconWishlist() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 15.25s-5.5-3.35-5.5-7.1A3.15 3.15 0 0 1 9 5.35a3.15 3.15 0 0 1 5.5 2.8c0 3.75-5.5 7.1-5.5 7.1z" />
    </svg>
  );
}

function NavIconBilling() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="4" width="14" height="10" rx="2" />
      <path d="M2 8h14" />
      <path d="M5 12h3" />
    </svg>
  );
}

function NavIconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="9" r="2.5" />
      <path d="M14.7 11.1a1.2 1.2 0 0 0 .24 1.32l.04.04a1.44 1.44 0 1 1-2.04 2.04l-.04-.04a1.2 1.2 0 0 0-1.32-.24 1.2 1.2 0 0 0-.72 1.08v.12a1.44 1.44 0 1 1-2.88 0v-.06a1.2 1.2 0 0 0-.78-1.08 1.2 1.2 0 0 0-1.32.24l-.04.04a1.44 1.44 0 1 1-2.04-2.04l.04-.04a1.2 1.2 0 0 0 .24-1.32 1.2 1.2 0 0 0-1.08-.72h-.12a1.44 1.44 0 1 1 0-2.88h.06a1.2 1.2 0 0 0 1.08-.78 1.2 1.2 0 0 0-.24-1.32l-.04-.04A1.44 1.44 0 1 1 5.7 3.3l.04.04a1.2 1.2 0 0 0 1.32.24h.06a1.2 1.2 0 0 0 .72-1.08v-.12a1.44 1.44 0 1 1 2.88 0v.06a1.2 1.2 0 0 0 .72 1.08 1.2 1.2 0 0 0 1.32-.24l.04-.04a1.44 1.44 0 1 1 2.04 2.04l-.04.04a1.2 1.2 0 0 0-.24 1.32v.06a1.2 1.2 0 0 0 1.08.72h.12a1.44 1.44 0 0 1 0 2.88h-.06a1.2 1.2 0 0 0-1.08.72z" />
    </svg>
  );
}

/** Canonical dashboard nav — labels must never be redefined elsewhere. */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { label: "Dashboard", href: "/dashboard", Icon: NavIconDashboard },
  { label: "Journeys", href: "/journeys", Icon: NavIconJourneys },
  { label: "Explore", href: "/explore", Icon: NavIconExplore },
  { label: "Wishlist", href: "/wishlist", Icon: NavIconWishlist },
  { label: "Billing", href: "/billing", Icon: NavIconBilling },
  { label: "Settings", href: "/settings", Icon: NavIconSettings },
];
