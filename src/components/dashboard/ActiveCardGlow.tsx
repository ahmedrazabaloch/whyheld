"use client";

import { motion } from "framer-motion";

interface ActiveCardGlowProps {
  isDark: boolean;
}

export function ActiveCardGlow({ isDark }: ActiveCardGlowProps) {
  // Layered glow: tight inner glow for definition + wide softer outer glow for ambient bleed.
  // Dark mode requires stronger opacity to be visible against dark backgrounds.
  const shadowValue = isDark
    ? "0 0 15px rgba(116, 135, 107, 0.45), 0 0 70px rgba(116, 135, 107, 0.25)"
    : "0 0 15px rgba(116, 135, 107, 0.35), 0 0 60px rgba(116, 135, 107, 0.15)";

  return (
    <motion.div
      className="pointer-events-none absolute -inset-[2px] -z-10 rounded-[2rem]"
      initial={{ opacity: 0.8, scale: 0.99 }}
      animate={{ opacity: [0.8, 1, 0.8], scale: [0.99, 1.01, 0.99] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{ boxShadow: shadowValue }}
    />
  );
}
