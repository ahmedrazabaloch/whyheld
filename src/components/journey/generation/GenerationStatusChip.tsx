"use client";

import { motion, AnimatePresence } from "motion/react";

interface GenerationStatusChipProps {
  message: string;
  state: string;
}

export function GenerationStatusChip({ message, state }: GenerationStatusChipProps) {
  const isPersisting = state === "PERSISTING";
  const isPreparing = state === "PREPARING";

  const displayMessage = isPersisting
    ? "Saving your itinerary…"
    : isPreparing
    ? "Connecting to AI concierge…"
    : message || "Planning your journey…";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={displayMessage}
        initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -4, filter: "blur(4px)" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.72)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(216, 210, 200, 0.6)",
          boxShadow: "0 4px 24px -8px rgba(51, 51, 47, 0.1)",
        }}
        role="status"
        aria-live="polite"
        aria-label={`AI status: ${displayMessage}`}
      >
        {/* Pulsing dot */}
        <span className="relative flex-shrink-0 flex h-2 w-2">
          <motion.span
            className="absolute inline-flex h-full w-full rounded-full"
            style={{ backgroundColor: "rgba(116, 135, 107, 0.6)" }}
            animate={{ scale: [1, 2], opacity: [0.6, 0] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
          />
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: "rgba(116, 135, 107, 1)" }}
          />
        </span>

        {/* Message */}
        <span
          className="text-sm leading-snug"
          style={{ color: "rgba(51, 51, 47, 0.85)" }}
        >
          {displayMessage}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
