"use client";

import { motion } from "motion/react";
import { riseVariants } from "./motion";

/** Primary + secondary call-to-action pairing with clear hierarchy. */
export function HeroCtas() {
  return (
    <motion.div
      variants={riseVariants}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <a
        href="/start"
        className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[#74876B] px-7 py-3.5 text-sm font-semibold text-[#F4EFE6] transition-all duration-300 hover:bg-[#5b6c53] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#74876B]"
      >
        Plan a slower journey
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
        >
          <path
            d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>

      <a
        href="#how"
        className="group inline-flex h-13 items-center justify-center gap-2 rounded-full border border-[#F4EFE6]/25 px-7 py-3.5 text-sm font-medium text-[#A8A69D] transition-colors duration-300 hover:border-[#F4EFE6]/40 hover:bg-[#F4EFE6]/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4EFE6]/40"
      >
        <span
          aria-hidden
          className="flex h-5 w-5 items-center justify-center rounded-full border border-[#F4EFE6]/30"
        >
          <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
            <path d="M4 3l4 3-4 3V3Z" fill="currentColor" />
          </svg>
        </span>
        How Wayheld works
      </a>
    </motion.div>
  );
}
