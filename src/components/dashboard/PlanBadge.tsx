"use client";

import { motion } from "framer-motion";

export function PlanBadge() {
  return (
    <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 z-10">
      <motion.span
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="inline-block whitespace-nowrap rounded-full bg-brand-btn-primary px-4 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-brand-bg shadow-sm"
      >
        Current Plan
      </motion.span>
    </div>
  );
}
