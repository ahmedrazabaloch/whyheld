"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { AiInsightPanel } from "./AiInsightPanel";
import { AnimatedHeadline } from "./AnimatedHeadline";
import { DestinationSelector } from "./DestinationSelector";
import { FeaturedStage } from "./FeaturedStage";
import { HeroCtas } from "./HeroCtas";
import {
  ACTIVE_HEADLINE,
  HERO_KICKER,
  HERO_SUBHEAD,
  SHOWCASE,
  SHOWCASE_INTERVAL,
} from "./hero.config";
import { containerVariants, riseVariants } from "./motion";
import { useShowcaseRotation } from "./useShowcaseRotation";

/**
 * Wayheld cinematic hero.
 *
 * A self-rotating destination showcase. One source of truth (`SHOWCASE`)
 * drives the featured stage, the thumbnail selector, the background
 * atmosphere and the AI recommendation in lockstep — so the entire hero
 * shifts mood with each destination every ~9s.
 *
 * Layout:
 *  - Header sits in normal flow; main content has its own top spacing so no
 *    card ever slides beneath the navigation.
 *  - Desktop: editorial copy (left) + showcase column (right).
 *  - Mobile: copy → featured stage → selector → AI panel, cleanly stacked
 *    with no overlap and no horizontal scroll.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { index, setIndex, progress } = useShowcaseRotation({
    count: SHOWCASE.length,
    interval: SHOWCASE_INTERVAL,
    paused: reduceMotion ?? false,
  });

  const active = SHOWCASE[index];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 70]);
  const stageY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : -50]);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-heading"
      className="relative isolate flex w-full flex-col overflow-hidden bg-[#2A2926]"
    >




      {/* Main content (offset by header height) */}
      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 items-start gap-10 px-5 pb-8 pt-24 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:pb-10 lg:pt-28">
        {/* Editorial column */}
        <motion.div
          style={{ y: reduceMotion ? undefined : copyY }}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="order-1 flex flex-col gap-4 lg:col-span-5 lg:gap-5"
        >
          <motion.p
            variants={riseVariants}
            className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.28em] text-[#A8A69D]"
          >
            <span className="h-px w-8 bg-sun-400/60" aria-hidden />
            {HERO_KICKER}
          </motion.p>

          <div id="hero-heading">
            <AnimatedHeadline headline={ACTIVE_HEADLINE} />
          </div>

          <motion.p
            variants={riseVariants}
            className="max-w-xl text-base leading-relaxed text-[#A8A69D] sm:text-lg"
          >
            {HERO_SUBHEAD}
          </motion.p>

          <HeroCtas />

          {/* Trust Signal */}
          <motion.div
            variants={riseVariants}
            className="mt-1 flex flex-wrap gap-x-8 gap-y-4 border-t border-[#F4EFE6]/10 pt-4 pb-2 sm:gap-x-10"
          >
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.16em] text-[#A8A69D]/80">
                120+ Heritage Regions Curated
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.16em] text-[#A8A69D]/80">
                Built for Intentional Travellers
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.16em] text-[#A8A69D]/80">
                Designed Around Slower Journeys
              </span>
            </div>
          </motion.div>

          {/* AI companion panel */}
          <motion.div variants={riseVariants} className="mt-1">
            <AiInsightPanel insight={active.insight} insightId={active.id} />
          </motion.div>
        </motion.div>

        {/* Showcase column */}
        <motion.div
          style={{ y: reduceMotion ? undefined : stageY }}
          className="order-2 flex flex-col gap-4 lg:col-span-7 lg:gap-5"
        >
          <FeaturedStage destination={active} />

          <DestinationSelector
            destinations={SHOWCASE}
            activeIndex={index}
            progress={progress}
            onSelect={setIndex}
          />
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="relative z-10 mx-auto hidden w-full max-w-7xl items-center justify-start px-10 pb-6 lg:flex"
      >
        <span className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.24em] text-[#A8A69D]/60">
          <span className="relative flex h-9 w-5 justify-center rounded-full border border-[#F4EFE6]/20">
            <motion.span
              aria-hidden
              animate={{ y: [3, 12, 3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="mt-1 h-1.5 w-1 rounded-full bg-mist-50/60"
            />
          </span>
          Scroll to explore
        </span>
      </motion.div>
    </section>
  );
}
