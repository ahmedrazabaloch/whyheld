"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Experiences", href: "/experiences" },
  { label: "Commitment", href: "/commitment" },
  { label: "Contact", href: "/contact" },
];

/**
 * Scroll-aware sticky/fixed top navigation header.
 * Globally stacked on top of all page content during scroll.
 */
export function Navbar({ user }: { user?: User }) {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  const [isSigningOut, setIsSigningOut] = useState(false);

  // If the pathname is exactly "/" and we haven't scrolled, 
  // it usually sits on a dark cinematic hero. Other pages might have lighter heroes.
  // To keep it simple and premium, we use the same scroll logic.
  // Wait, if it's an inner page with a different hero, maybe the starting color is different?
  // We'll stick to the current design system which assumes the hero provides a dark underlay at the top.

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    // Trigger once on mount to handle browser restored scroll position
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-[#F4EFE6] border-b border-[#D8D2C8] py-3.5 shadow-[0_2px_20px_rgba(51,51,47,0.08)]"
        : "bg-[rgba(116,135,107,0.92)] border-b border-[rgba(244,239,230,0.15)] py-4.5 backdrop-blur-md"
    }`}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-10">
        <div className="flex flex-1 justify-start">
          <Link
            href="/"
            className={`font-display text-xl tracking-tight transition-colors duration-300 ${
              scrolled ? "text-[#33332F]" : "text-[#F4EFE6]"
            }`}
            aria-label="Wayheld home"
          >
            Wayheld
          </Link>
        </div>
        <nav
          aria-label="Primary"
          className={`hidden items-center gap-8 text-sm md:flex transition-colors duration-300 ${
            scrolled ? "text-[#504F4A]" : "text-[#F4EFE6]"
          }`}
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative transition-colors ${
                  scrolled ? "hover:text-[#33332F]" : "hover:text-[#FFFFFF]"
                } ${isActive ? (scrolled ? "text-[#33332F] font-semibold" : "text-[#FFFFFF] font-semibold") : ""}`}
              >
                {link.label}
                {isActive && (
                  <span
                    className={`absolute -bottom-1.5 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full transition-colors ${
                      scrolled ? "bg-[#74876B]" : "bg-[#F4EFE6]"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-1 justify-end">
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 ${
                scrolled
                  ? "bg-[#74876B] text-[#F4EFE6] hover:bg-[#5b6c53] hover:-translate-y-px"
                  : "bg-[#F4EFE6] text-[#33332F] hover:bg-white hover:-translate-y-px"
              }`}
            >
              {user.name || user.email?.split("@")[0]}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}>
                <path d="M3 4.5l3 3 3-3" />
              </svg>
            </button>
            
            <div
              className={`absolute right-0 mt-3 w-48 origin-top-right rounded-3xl border border-[#D8D2C8] bg-[#F4EFE6] p-2 shadow-xl ring-1 ring-black/5 transition-all duration-150 focus:outline-none ${
                dropdownOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
              }`}
            >
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="block cursor-pointer rounded-2xl px-4 py-2.5 text-sm font-medium text-[#33332F] transition-colors duration-150 hover:bg-[#74876B] hover:text-[#F4EFE6]"
              >
                Dashboard
              </Link>
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="block cursor-pointer rounded-2xl px-4 py-2.5 text-sm font-medium text-[#33332F] transition-colors duration-150 hover:bg-[#74876B] hover:text-[#F4EFE6]"
              >
                Settings
              </Link>
              <button
                disabled={isSigningOut}
                onClick={async () => {
                  if (isSigningOut) return;
                  setIsSigningOut(true);
                  setDropdownOpen(false);
                  await signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center gap-2 cursor-pointer rounded-2xl px-4 py-2.5 text-left text-sm font-medium text-[#33332F] transition-colors duration-150 hover:bg-[#74876B] hover:text-[#F4EFE6] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSigningOut ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-inherit" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing out...</span>
                  </>
                ) : (
                  <span>Sign out</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/login"
            className={`inline-flex cursor-pointer items-center justify-center rounded-full px-6 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 ${
              scrolled
                ? "bg-[#74876B] text-[#F4EFE6] hover:bg-[#5b6c53] hover:-translate-y-px"
                : "bg-[#F4EFE6] text-[#33332F] hover:bg-white hover:-translate-y-px"
            }`}
          >
            Begin
          </Link>
        )}
        </div>
      </div>
    </header>
  );
}
