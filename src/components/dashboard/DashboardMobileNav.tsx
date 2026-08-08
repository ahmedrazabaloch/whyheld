"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "./nav";

function isNavActive(pathname: string, href: string) {
  return (
    pathname === href ||
    (href !== "/dashboard" && pathname.startsWith(`${href}/`))
  );
}

/** Primary bottom tabs — short labels; rest live in More. */
const PRIMARY_HREFS = ["/dashboard", "/explore", "/wishlist", "/journeys"] as const;

const PRIMARY_LABELS: Record<(typeof PRIMARY_HREFS)[number], string> = {
  "/dashboard": "Home",
  "/explore": "Explore",
  "/wishlist": "Wishlist",
  "/journeys": "Journeys",
};

const MORE_HREFS = ["/past-journeys", "/billing", "/profile"] as const;

/**
 * Mobile-only floating bottom nav for the dashboard shell.
 * Four primary tabs + More (Past Journeys, Billing, Profile, Sign out).
 * Hidden from lg and up — desktop keeps the sidebar.
 */
export function DashboardMobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const primaryItems = PRIMARY_HREFS.map((href) => {
    const item = DASHBOARD_NAV_ITEMS.find((nav) => nav.href === href);
    if (!item) throw new Error(`Missing dashboard nav item: ${href}`);
    return { ...item, label: PRIMARY_LABELS[href] };
  });

  const moreItems = [
    ...MORE_HREFS.map((href) => {
      if (href === "/profile") {
        return {
          label: "Profile",
          href: "/profile",
        };
      }
      const item = DASHBOARD_NAV_ITEMS.find((nav) => nav.href === href);
      if (!item) throw new Error(`Missing dashboard nav item: ${href}`);
      return { label: item.label, href: item.href };
    }),
  ];

  const isMoreRouteActive = moreItems.some((item) =>
    isNavActive(pathname, item.href),
  );
  const isMoreActive = moreOpen || isMoreRouteActive;

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto absolute inset-0 h-[100dvh] w-full bg-[#33332F]/35"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              id="dashboard-more-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="More navigation"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="pointer-events-auto absolute inset-x-3 bottom-[5.75rem] overflow-hidden rounded-[1.75rem] border border-[#D8D2C8] bg-[#F4EFE6] shadow-[0_20px_50px_-20px_rgba(51,51,47,0.35)]"
            >
              <div className="flex items-center justify-between border-b border-[#D8D2C8] px-5 py-4">
                <p className="text-sm font-semibold text-[#33332F]">More</p>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#504F4A] transition-colors hover:bg-[#D8D2C8]/50 hover:text-[#33332F]"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>

              <nav className="flex flex-col p-3" aria-label="More links">
                {moreItems.map((item) => {
                  const active = isNavActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      onClick={() => setMoreOpen(false)}
                      className={`rounded-2xl px-4 py-3.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-[#74876B] text-[#F4EFE6]"
                          : "text-[#33332F] hover:bg-[#74876B]/12"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <button
                  type="button"
                  disabled={isSigningOut}
                  onClick={async () => {
                    if (isSigningOut) return;
                    setIsSigningOut(true);
                    setMoreOpen(false);
                    try {
                      await signOut({ callbackUrl: "/" });
                    } catch {
                      window.location.assign("/");
                    } finally {
                      setIsSigningOut(false);
                    }
                  }}
                  className="rounded-2xl px-4 py-3.5 text-left text-sm font-medium text-[#33332F] transition-colors hover:bg-[#74876B]/12 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </button>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        aria-label="Mobile primary"
        className="pointer-events-auto mx-3 mb-[max(0.75rem,env(safe-area-inset-bottom))] rounded-[2rem] border border-[#D8D2C8]/80 bg-white px-2 pb-2 pt-1.5 shadow-[0_12px_40px_-12px_rgba(51,51,47,0.28)]"
      >
        <ul className="grid grid-cols-5 items-end">
          {primaryItems.map(({ label, href, Icon }) => {
            const isActive = !moreOpen && isNavActive(pathname, href);
            return (
              <li key={href} className="flex justify-center">
                <Link
                  href={href}
                  prefetch={false}
                  onClick={() => setMoreOpen(false)}
                  className="relative flex w-full flex-col items-center gap-1 px-1 pb-1 pt-2"
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ${
                      isActive
                        ? "-mt-5 bg-white text-[#74876B] shadow-[0_6px_18px_rgba(51,51,47,0.14)] ring-4 ring-[#74876B]/18"
                        : "text-[#666666]"
                    }`}
                  >
                    <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
                      <Icon />
                    </span>
                  </span>
                  <span
                    className={`text-[10px] leading-none ${
                      isActive
                        ? "font-semibold text-[#74876B]"
                        : "font-medium text-[#666666]"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}

          <li className="flex justify-center">
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              className="relative flex w-full cursor-pointer flex-col items-center gap-1 px-1 pb-1 pt-2"
              aria-expanded={moreOpen}
              aria-controls="dashboard-more-sheet"
              aria-label="More"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ${
                  isMoreActive
                    ? "-mt-5 bg-white text-[#74876B] shadow-[0_6px_18px_rgba(51,51,47,0.14)] ring-4 ring-[#74876B]/18"
                    : "text-[#666666]"
                }`}
              >
                {moreOpen ? (
                  <X className="h-5 w-5" strokeWidth={2.25} />
                ) : (
                  <Menu
                    className="h-5 w-5"
                    strokeWidth={isMoreActive ? 2.25 : 1.75}
                  />
                )}
              </span>
              <span
                className={`text-[10px] leading-none ${
                  isMoreActive
                    ? "font-semibold text-[#74876B]"
                    : "font-medium text-[#666666]"
                }`}
              >
                More
              </span>
            </button>
          </li>
        </ul>

        <div
          className="mx-auto mt-1 h-1 w-24 rounded-full bg-[#D8D2C8]"
          aria-hidden
        />
      </nav>
    </div>
  );
}
