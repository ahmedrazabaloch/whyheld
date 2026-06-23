"use client";

import { useEffect, useState } from "react";

/**
 * Scroll-aware sticky/fixed top navigation header.
 * By rendering this at the root level of the page (outside any isolate/overflow-hidden sections),
 * it remains globally stacked on top of all page content during scroll.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

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
        : "bg-[#2A2926]/80 border-b border-[#F4EFE6]/10 py-4.5 backdrop-blur-md"
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
            scrolled ? "text-[#504F4A]" : "text-[#A8A69D]"
          }`}
        >
          <a className={`transition-colors ${scrolled ? "hover:text-[#33332F]" : "hover:text-[#F4EFE6]"}`} href="#why">
            Why Wayheld
          </a>
          <a className={`transition-colors ${scrolled ? "hover:text-[#33332F]" : "hover:text-[#F4EFE6]"}`} href="#journeys">
            Journeys
          </a>
          <a className={`transition-colors ${scrolled ? "hover:text-[#33332F]" : "hover:text-[#F4EFE6]"}`} href="#how">
            How it works
          </a>
        </nav>
        <a
          href="/start"
          className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
            scrolled
              ? "border-[#33332F]/20 text-[#33332F] hover:bg-[#33332F]/5 hover:border-[#33332F]/45"
              : "border-[#F4EFE6]/25 text-[#F4EFE6] hover:bg-[#F4EFE6]/8 hover:border-[#F4EFE6]/45"
          }`}
        >
          Begin
        </a>
      </div>
    </header>
  );
}
