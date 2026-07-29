"use client";

import { motion } from "motion/react";
import { buttonStyles } from "@/lib/design";

interface GenerationErrorStateProps {
  type: "FAILED" | "CANCELLED";
  error: string | null;
  onRetry: () => void;
  onAbort: () => void;
}

export function GenerationErrorState({
  type,
  error,
  onRetry,
  onAbort,
}: GenerationErrorStateProps) {
  const isFailed = type === "FAILED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      {/* Icon container */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="relative mb-8"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: isFailed
              ? "rgba(220, 85, 65, 0.08)"
              : "rgba(168, 166, 157, 0.1)",
            border: `1px solid ${isFailed ? "rgba(220, 85, 65, 0.2)" : "rgba(216, 210, 200, 0.5)"}`,
          }}
        >
          {isFailed ? (
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(200, 70, 50, 0.85)"
              strokeWidth="1.5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          ) : (
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(168, 166, 157, 0.85)"
              strokeWidth="1.5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>
        {/* Ambient glow */}
        <div
          className="absolute inset-0 rounded-full blur-xl -z-10"
          style={{
            background: isFailed
              ? "rgba(220, 85, 65, 0.06)"
              : "rgba(168, 166, 157, 0.06)",
          }}
        />
      </motion.div>

      {/* Headline */}
      <motion.h3
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="font-display text-3xl font-light tracking-tight mb-3"
        style={{ color: "rgba(51, 51, 47, 1)" }}
      >
        {isFailed ? "Something went wrong" : "Generation cancelled"}
      </motion.h3>

      {/* Subtext */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="text-base leading-relaxed max-w-sm mb-10"
        style={{ color: "rgba(80, 79, 74, 0.75)" }}
      >
        {isFailed
          ? error ||
            "We couldn't complete your journey. Your credit was not charged. Please try again."
          : "You cancelled the generation. Your credit was not charged. Ready to try again?"}
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.42 }}
        className="flex items-center gap-4"
      >
        <button
          type="button"
          onClick={onAbort}
          className={buttonStyles.secondary}
          style={{ minWidth: "120px" }}
        >
          {isFailed ? "Cancel" : "Go back"}
        </button>
        {isFailed && (
          <button
            type="button"
            onClick={onRetry}
            className={buttonStyles.primary}
            style={{ minWidth: "140px" }}
          >
            Try again
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
