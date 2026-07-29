"use client";

import { motion } from "motion/react";

interface GenerationProgressBarProps {
  progress: number;
  state: string;
}

export function GenerationProgressBar({ progress, state }: GenerationProgressBarProps) {
  const isPersisting = state === "PERSISTING";
  const displayProgress = progress;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span
          className="text-[0.65rem] font-medium uppercase tracking-[0.22em]"
          style={{ color: "rgba(168, 166, 157, 0.9)" }}
        >
          {isPersisting ? "Saving your journey" : "Generation progress"}
        </span>
        <motion.span
          className="text-[0.7rem] font-medium tabular-nums"
          style={{ color: "rgba(116, 135, 107, 0.9)" }}
          key={displayProgress}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
        >
          {Math.round(displayProgress)}%
        </motion.span>
      </div>

      {/* Track */}
      <div
        className="relative w-full h-[3px] rounded-full overflow-hidden"
        style={{ background: "rgba(216, 210, 200, 0.35)" }}
        role="progressbar"
        aria-valuenow={Math.round(displayProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Journey generation progress"
      >
        {/* Filled bar */}
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(116,135,107,0.6) 0%, rgba(116,135,107,1) 60%, rgba(180,160,120,0.9) 100%)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${displayProgress}%` }}
          transition={{ type: "spring", stiffness: 40, damping: 14 }}
        />

        {/* Shimmer sweep */}
        {displayProgress > 0 && displayProgress < 100 && (
          <motion.div
            className="absolute top-0 h-full w-12 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
              left: `${Math.max(0, displayProgress - 8)}%`,
            }}
            animate={{ left: [`${Math.max(0, displayProgress - 20)}%`, `${displayProgress + 4}%`] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          />
        )}
      </div>
    </div>
  );
}
