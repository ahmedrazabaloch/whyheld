import type { ComponentType } from "react";

/**
 * Single source of truth for dashboard navigation labels and routes.
 * Sidebar and DashboardMobileNav must both consume this — never duplicate labels.
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
      <path d="M2.5 4.2 6.5 2.5v13L2.5 13.8V4.2Z" />
      <path d="M6.5 2.5 11.5 4.2v13L6.5 15.5V2.5Z" />
      <path d="M11.5 4.2 15.5 2.5v13l-4 1.7V4.2Z" />
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

function NavIconPastJourneys() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="9" cy="9" r="6.5" />
      <path d="M5.5 9.2 8 11.5 12.5 6.5" />
    </svg>
  );
}

/** Canonical dashboard nav — labels must never be redefined elsewhere. */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { label: "Dashboard", href: "/dashboard", Icon: NavIconDashboard },
  { label: "Journeys", href: "/journeys", Icon: NavIconJourneys },
  { label: "Explore", href: "/explore", Icon: NavIconExplore },
  { label: "Wishlist", href: "/wishlist", Icon: NavIconWishlist },
  { label: "Past Journeys", href: "/past-journeys", Icon: NavIconPastJourneys },
  { label: "Billing", href: "/billing", Icon: NavIconBilling },
];
