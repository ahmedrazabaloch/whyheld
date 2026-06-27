"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { User } from "next-auth";

/**
 * Scroll-aware sticky/fixed top navigation header.
 * By rendering this at the root level of the page (outside any isolate/overflow-hidden sections),
 * it remains globally stacked on top of all page content during scroll.
 */
export function Navbar({ user }: { user?: User }) {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
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
        <a
          href="#"
          className={`font-display text-xl tracking-tight transition-colors duration-300 ${
            scrolled ? "text-[#33332F]" : "text-[#F4EFE6]"
          }`}
          aria-label="Wayheld home"
        >
          Wayheld
        </a>
        <nav
          aria-label="Primary"
          className={`hidden items-center gap-8 text-sm md:flex transition-colors duration-300 ${
            scrolled ? "text-[#504F4A]" : "text-[#F4EFE6]"
          }`}
        >
          <a className={`transition-colors ${scrolled ? "hover:text-[#33332F]" : "hover:text-[#FFFFFF]"}`} href="#why">
            Why Wayheld
          </a>
          <a className={`transition-colors ${scrolled ? "hover:text-[#33332F]" : "hover:text-[#FFFFFF]"}`} href="#journeys">
            Journeys
          </a>
          <a className={`transition-colors ${scrolled ? "hover:text-[#33332F]" : "hover:text-[#FFFFFF]"}`} href="#how">
            How it works
          </a>
        </nav>
        {user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
                scrolled
                  ? "border-[#33332F]/20 text-[#33332F] hover:bg-[#33332F]/5 hover:border-[#33332F]/45"
                  : "border-[rgba(244,239,230,0.45)] text-[#F4EFE6] hover:bg-[#F4EFE6]/8 hover:border-[#F4EFE6]/45"
              }`}
            >
              {user.name || "Traveler"}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}>
                <path d="M3 4.5l3 3 3-3" />
              </svg>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-[rgba(51,51,47,0.1)] bg-white p-2 shadow-xl ring-1 ring-black/5 focus:outline-none">
                <Link
                  href="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="block rounded-xl px-4 py-2 text-sm font-medium text-[#504F4A] transition-colors hover:bg-black/5 hover:text-[#33332F]"
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="block rounded-xl px-4 py-2 text-sm font-medium text-[#504F4A] transition-colors hover:bg-black/5 hover:text-[#33332F]"
                >
                  Settings
                </Link>
                <button
                  onClick={() => { setDropdownOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="block w-full text-left rounded-xl px-4 py-2 text-sm font-medium text-[#504F4A] transition-colors hover:bg-black/5 hover:text-[#33332F]"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <a
            href="/start"
            className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
              scrolled
                ? "border-[#33332F]/20 text-[#33332F] hover:bg-[#33332F]/5 hover:border-[#33332F]/45"
                : "border-[rgba(244,239,230,0.45)] text-[#F4EFE6] hover:bg-[#F4EFE6]/8 hover:border-[#F4EFE6]/45"
            }`}
          >
            Begin
          </a>
        )}
      </div>
    </header>
  );
}
