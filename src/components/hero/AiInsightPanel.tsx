"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { AiInsight } from "./types";

interface AiInsightPanelProps {
  /** The insight to display — driven by the currently featured destination. */
  insight: AiInsight;
  /** Stable id of the active insight, used to re-trigger the reveal. */
  insightId: string;
}

type Phase = "typing" | "thinking" | "answering";

/**
 * An ambient AI companion surface, synced to the showcase. When the featured
 * destination changes, Wayheld "re-types" the new intent, considers it, then
 * streams the matching recommendation — reinforcing that one intelligence
 * drives the whole hero.
 *
 * Deliberately NOT a chat window — single exchange, no avatars, no input bar,
 * no message bubbles stacking into a dashboard.
 */
export function AiInsightPanel({ insight, insightId }: AiInsightPanelProps) {
  const reduceMotion = useReducedMotion();
  const motionless = reduceMotion ?? false;

  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState("");

  // Re-run the type → think → answer sequence whenever the insight changes.
  useEffect(() => {
    if (motionless) {
      const motionlessTimer = setTimeout(() => {
        setTyped(insight.query);
        setPhase("answering");
      }, 0);
      return () => clearTimeout(motionlessTimer);
    }

    const resetTimer = setTimeout(() => {
      setTyped("");
      setPhase("typing");
    }, 0);

    let charTimer: ReturnType<typeof setTimeout>;
    let thinkTimer: ReturnType<typeof setTimeout>;
    let i = 0;

    const typeNext = () => {
      i += 1;
      setTyped(insight.query.slice(0, i));
      if (i < insight.query.length) {
        charTimer = setTimeout(typeNext, 34 + Math.random() * 40);
      } else {
        setPhase("thinking");
        thinkTimer = setTimeout(() => setPhase("answering"), 850);
      }
    };

    charTimer = setTimeout(typeNext, 300);

    return () => {
      clearTimeout(resetTimer);
      clearTimeout(charTimer);
      clearTimeout(thinkTimer);
    };
  }, [insightId, insight.query, motionless]);

  return (
    <motion.aside
      aria-label="Wayheld AI recommendation"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className="relative overflow-hidden min-h-[360px] max-h-[360px] rounded-3xl border border-[rgba(244,239,230,0.18)] bg-[rgba(51,51,47,0.35)] p-5 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.95)] backdrop-blur-[12px] sm:p-6"
    >
      {/* Soft inner glow that breathes */}
      <motion.div
        aria-hidden
        animate={
          motionless ? undefined : { opacity: [0.35, 0.6, 0.35], scale: [1, 1.05, 1] }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-ocean-500/20 blur-3xl"
      />

      {/* Header: the "presence" indicator */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <motion.span
              aria-hidden
              animate={motionless ? undefined : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inline-flex h-full w-full rounded-full bg-[#74876B]"
            />
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#74876B]/40" />
          </span>
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[rgba(244,239,230,0.82)]">
            Wayheld considers
          </span>
        </div>
        <span className="font-display text-sm italic text-[rgba(244,239,230,0.82)]">
          context
        </span>
      </div>

      {/* The traveller's intent */}
      <div className="relative mt-5">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#F4EFE6]">
          You
        </p>
        <p className="mt-1.5 font-display text-lg leading-snug text-[#F4EFE6] line-clamp-2">
          {typed}
          {!motionless && phase === "typing" && (
            <motion.span
              aria-hidden
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="ml-0.5 inline-block h-5 w-px translate-y-1 bg-sun-400"
            />
          )}
        </p>
      </div>

      {/* Wayheld's response */}
      <div className="relative mt-4 min-h-30" aria-live="polite">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#F4EFE6]">
          Wayheld
        </p>

        <AnimatePresence mode="wait">
          {phase === "thinking" && !motionless ? (
            <motion.div
              key={`thinking-${insightId}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex items-center gap-1.5"
              aria-label="Thinking"
            >
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: d * 0.16,
                    ease: "easeInOut",
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-sun-300"
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`answer-${insightId}`}
              initial={motionless ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="mt-2 text-[0.95rem] leading-relaxed text-[rgba(244,239,230,0.82)] line-clamp-3">
                {insight.response}
              </p>

              <ul className="mt-4 flex flex-wrap gap-2">
                {insight.signals.map((signal, i) => (
                  <motion.li
                    key={signal}
                    initial={motionless ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.1, duration: 0.5 }}
                    className="rounded-full border border-[#F4EFE6]/12 bg-[rgba(244,239,230,0.12)] px-2.5 py-1 text-[0.68rem] font-medium tracking-wide text-[#F4EFE6]"
                  >
                    {signal}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
