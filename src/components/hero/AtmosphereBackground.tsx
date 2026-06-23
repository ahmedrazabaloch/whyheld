"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import type { Atmosphere } from "./types";

interface AtmosphereBackgroundProps {
  atmosphere: Atmosphere;
  /** Stable id used to crossfade between atmospheres. */
  atmosphereId: string;
  /** Scroll-driven opacity so the field recedes as the user scrolls away. */
  opacity?: MotionValue<number> | number;
}

/**
 * Pre-computed atmospheric particle field. Static values keep SSR and client
 * markup identical (no hydration mismatch) while still feeling organic.
 */
const PARTICLES = [
  { left: "12%", top: "30%", size: 3, opacity: 0.5, duration: 9, delay: 0 },
  { left: "26%", top: "62%", size: 2, opacity: 0.4, duration: 11, delay: 1.5 },
  { left: "44%", top: "22%", size: 2, opacity: 0.35, duration: 10, delay: 0.8 },
  { left: "58%", top: "70%", size: 3, opacity: 0.45, duration: 12, delay: 2.2 },
  { left: "70%", top: "38%", size: 2, opacity: 0.4, duration: 9.5, delay: 3 },
  { left: "82%", top: "58%", size: 2.5, opacity: 0.5, duration: 13, delay: 1 },
  { left: "36%", top: "84%", size: 2, opacity: 0.3, duration: 10.5, delay: 2.6 },
  { left: "90%", top: "26%", size: 2, opacity: 0.4, duration: 11.5, delay: 0.4 },
] as const;

/**
 * The living background. Three large aurora glows breathe and drift, and
 * crossfade to a new color palette whenever the featured destination changes —
 * so the whole hero shifts mood with the journey. Grain, vignette and a
 * drifting particle field add cinematic depth.
 */
export function AtmosphereBackground({
  atmosphere,
  atmosphereId,
  opacity = 1,
}: AtmosphereBackgroundProps) {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {/* Color aurora — crossfades between destinations */}
      <motion.div
        aria-hidden
        style={{ opacity }}
        className="pointer-events-none absolute inset-0 -z-20"
      >
        <AnimatePresence>
          <motion.div
            key={atmosphereId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : { x: [0, 40, 0], y: [0, 30, 0], opacity: [0.7, 1, 0.7] }
              }
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[-10%] top-[-15%] h-[55vh] w-[55vh] rounded-full"
              style={{ background: `radial-gradient(circle, ${atmosphere.primary} 0%, transparent 70%)` }}
            />
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : { x: [0, -50, 0], y: [0, 40, 0], opacity: [0.6, 0.95, 0.6] }
              }
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute right-[-10%] top-[8%] h-[60vh] w-[60vh] rounded-full"
              style={{ background: `radial-gradient(circle, ${atmosphere.secondary} 0%, transparent 70%)` }}
            />
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : { x: [0, 30, 0], y: [0, -30, 0], opacity: [0.5, 0.85, 0.5] }
              }
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
              className="absolute bottom-[-20%] left-[28%] h-[50vh] w-[50vh] rounded-full"
              style={{ background: `radial-gradient(circle, ${atmosphere.accent} 0%, transparent 70%)` }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Vignette for cinematic focus */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_55%,var(--color-forest-950)_100%)]"
      />

      {/* Film grain for premium texture */}
      <div
        aria-hidden
        className="bg-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.07] mix-blend-soft-light"
      />

      {/* Drifting atmospheric particles */}
      {!reduceMotion && (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          {PARTICLES.map((p, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -28, 0], opacity: [0, p.opacity, 0] }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay,
              }}
              style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
              className="absolute rounded-full bg-mist-50"
            />
          ))}
        </div>
      )}
    </>
  );
}
