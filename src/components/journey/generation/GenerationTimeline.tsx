"use client";

import { motion } from "motion/react";

const STEPS = [
  { emoji: "🌍", label: "Analysing destination", threshold: 0 },
  { emoji: "🧠", label: "Understanding preferences", threshold: 16 },
  { emoji: "🍷", label: "Finding authentic experiences", threshold: 31 },
  { emoji: "🏨", label: "Selecting accommodations", threshold: 51 },
  { emoji: "🗺️", label: "Designing your route", threshold: 66 },
  { emoji: "✨", label: "Finalising itinerary", threshold: 81 },
];

interface GenerationTimelineProps {
  progress: number;
  state: string;
}

export function GenerationTimeline({ progress, state }: GenerationTimelineProps) {
  const isPersisting = state === "PERSISTING";
  const effectiveProgress = progress;

  const activeStep = [...STEPS]
    .reverse()
    .find((s) => effectiveProgress >= s.threshold);
  const activeIndex = activeStep ? STEPS.indexOf(activeStep) : 0;

  return (
    <div className="relative" role="list" aria-label="Generation progress steps">
      {/* Vertical line */}
      <div
        className="absolute left-[19px] top-5 bottom-5 w-px"
        style={{ background: "rgba(216, 210, 200, 0.3)" }}
        aria-hidden
      />
      {/* Animated fill line */}
      <motion.div
        className="absolute left-[19px] top-5 w-px origin-top"
        style={{ background: "rgba(116, 135, 107, 0.7)" }}
        initial={{ scaleY: 0 }}
        animate={{
          scaleY: effectiveProgress > 0 ? Math.min(activeIndex / (STEPS.length - 1), 1) : 0,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden
        // Height matches from top-5 to bottom of last step icon
        // We use a fixed pixel approach via transform-origin
      />

      <ol className="space-y-5">
        {STEPS.map((step, i) => {
          const isComplete = effectiveProgress > step.threshold && i < activeIndex;
          const isActive = i === activeIndex && effectiveProgress >= step.threshold;
          const isPending = !isComplete && !isActive;

          return (
            <motion.li
              key={step.label}
              role="listitem"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex items-center gap-4 pl-1"
            >
              {/* Step dot / emoji */}
              <div className="relative z-10 flex-shrink-0 w-9 h-9 flex items-center justify-center">
                {isComplete ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(116, 135, 107, 0.15)", border: "1px solid rgba(116, 135, 107, 0.4)" }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8l3.5 3.5L13 5"
                        stroke="rgba(116,135,107,0.95)"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                    style={{
                      background: "rgba(116, 135, 107, 0.12)",
                      border: "1px solid rgba(116, 135, 107, 0.5)",
                      boxShadow: "0 0 0 4px rgba(116, 135, 107, 0.07)",
                    }}
                    animate={{ boxShadow: ["0 0 0 4px rgba(116,135,107,0.07)", "0 0 0 8px rgba(116,135,107,0.03)", "0 0 0 4px rgba(116,135,107,0.07)"] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span role="img" aria-label={step.label}>{step.emoji}</span>
                  </motion.div>
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-base"
                    style={{
                      background: "rgba(244, 239, 230, 0.04)",
                      border: "1px solid rgba(216, 210, 200, 0.25)",
                    }}
                  >
                    <span role="img" aria-label={step.label} style={{ opacity: 0.3 }}>
                      {step.emoji}
                    </span>
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="flex flex-col">
                <motion.span
                  className="text-sm leading-snug"
                  animate={{
                    color: isActive
                      ? "rgba(51, 51, 47, 1)"
                      : isComplete
                      ? "rgba(80, 79, 74, 0.85)"
                      : "rgba(168, 166, 157, 0.6)",
                    fontWeight: isActive ? 500 : 400,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {step.label}
                </motion.span>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[0.65rem] uppercase tracking-[0.2em] mt-0.5"
                    style={{ color: "rgba(116, 135, 107, 0.8)" }}
                  >
                    In progress
                  </motion.span>
                )}
                {isComplete && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[0.65rem] uppercase tracking-[0.2em] mt-0.5"
                    style={{ color: "rgba(116, 135, 107, 0.55)" }}
                  >
                    Complete
                  </motion.span>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
