"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";
import { AnimatePresence, motion } from "motion/react";
import {
  Compass,
  Home,
  Info,
  Mail,
  Menu,
  X,
} from "lucide-react";

const PRIMARY_TABS = [
  { label: "Home", href: "/", Icon: Home },
  { label: "About", href: "/about", Icon: Info },
  { label: "Experiences", href: "/experiences", Icon: Compass },
  { label: "Contact", href: "/contact", Icon: Mail },
] as const;

const MORE_PAGE = { label: "Commitment", href: "/commitment" } as const;

/**
 * Mobile-only floating bottom nav for marketing pages.
 * Four primary tabs + More sheet (Commitment, Begin / account).
 * Hidden from md and up — desktop keeps the top Navbar links.
 */
export function MarketingMobileNav({ user }: { user?: User }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isMorePageActive = pathname === MORE_PAGE.href;
  const isMoreActive = moreOpen || isMorePageActive;

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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden">
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
              id="marketing-more-sheet"
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
                <Link
                  href={MORE_PAGE.href}
                  onClick={() => setMoreOpen(false)}
                  className={`rounded-2xl px-4 py-3.5 text-sm font-medium transition-colors ${
                    isMorePageActive
                      ? "bg-[#74876B] text-[#F4EFE6]"
                      : "text-[#33332F] hover:bg-[#74876B]/12"
                  }`}
                >
                  {MORE_PAGE.label}
                </Link>

                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMoreOpen(false)}
                      className="rounded-2xl px-4 py-3.5 text-sm font-medium text-[#33332F] transition-colors hover:bg-[#74876B]/12"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMoreOpen(false)}
                      className="rounded-2xl px-4 py-3.5 text-sm font-medium text-[#33332F] transition-colors hover:bg-[#74876B]/12"
                    >
                      Profile
                    </Link>
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
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMoreOpen(false)}
                    className="mt-1 rounded-2xl bg-[#74876B] px-4 py-3.5 text-center text-sm font-medium text-[#F4EFE6] transition-colors hover:bg-[#5b6c53]"
                  >
                    Begin
                  </Link>
                )}
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
          {PRIMARY_TABS.map(({ label, href, Icon }) => {
            const isActive = !moreOpen && pathname === href;
            return (
              <li key={href} className="flex justify-center">
                <Link
                  href={href}
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
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={isActive ? 2.25 : 1.75}
                      fill={isActive && label === "Home" ? "currentColor" : "none"}
                    />
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
              aria-controls="marketing-more-sheet"
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
