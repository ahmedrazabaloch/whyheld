"use client";

import { motion, useReducedMotion } from "motion/react";
import { Section } from "@/components/ui";
import {
  containerVariants,
  EASE_EXPO,
  kicker,
  leadParagraph,
  riseVariants,
  sectionTitle,
} from "@/lib/design";
import {
  CONTRASTS,
  WHY_HEADLINE,
  WHY_INTRO,
  WHY_KICKER,
} from "./why-broken.config";

/**
 * "Why Travel Feels Broken" — the storytelling beat directly after the hero.
 *
 * The layout is a deliberate visual argument: the left rail lists what modern
 * travel has become (muted, fragmented), and each row resolves into the
 * Wayheld counter-principle on the right (warm, whole). Everything reveals on
 * scroll and respects reduced-motion.
 */
export function WhyTravelBroken() {
  const reduceMotion = useReducedMotion();

  return (
    <Section
      id="why"
      labelledBy="why-heading"

    >
      <>
        {/* Intro */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="max-w-3xl"
        >
          <motion.p variants={riseVariants} className={kicker}>
            <span className="h-px w-8 bg-[#74876B]/60" aria-hidden />
            {WHY_KICKER}
          </motion.p>

          <motion.h2
            id="why-heading"
            variants={riseVariants}
            className={`mt-6 ${sectionTitle}`}
          >
            {WHY_HEADLINE.lead}{" "}
            <span className="italic text-[#74876B]">{WHY_HEADLINE.accent}</span>
            {WHY_HEADLINE.tail}
          </motion.h2>

          <motion.p
            variants={riseVariants}
            className={`mt-6 max-w-2xl ${leadParagraph}`}
          >
            {WHY_INTRO}
          </motion.p>
        </motion.div>

        {/* Premium Comparison Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 lg:gap-8 lg:mt-12"
        >
          {CONTRASTS.map((row) => (
            <motion.div
              key={row.problem}
              variants={riseVariants}
              className="group relative overflow-hidden rounded-3xl border border-[#D8D2C8] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#33332F]/5"
            >
              {/* Problem Section (Muted) */}
              <div className="mb-6 border-b border-[#F4EFE6] pb-6">
                <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#A8A69D]/60">
                  Modern Travel
                </span>
                <h3 className="font-display text-xl text-[#A8A69D] line-through decoration-[#A8A69D]/30 decoration-1 sm:text-2xl">
                  {row.problem}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#A8A69D]">
                  {row.problemDetail}
                </p>
              </div>

              {/* Wayheld Solution Section (Highlighted) */}
              <div className="relative">
                <span className="mb-2 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#74876B]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#74876B]" />
                  The Wayheld Way
                </span>
                <h3 className="font-display text-2xl text-[#33332F] sm:text-3xl">
                  {row.answer}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#504F4A]">
                  {row.answerDetail}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Closing statement */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: EASE_EXPO }}
          className="mt-12 border-t border-[#D8D2C8] pt-10 lg:mt-16"
        >
          <p className="max-w-3xl font-display text-balance text-2xl font-light leading-snug text-[#33332F] sm:text-3xl">
            Wayheld exists to give travel back its{" "}
            <span className="italic text-[#74876B]">meaning</span> — slower,
            deeper, and rooted in the places and people that make a journey
            worth taking.
          </p>
          <a
            href="#how"
            className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#33332F] transition-colors hover:text-[#74876B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#74876B]"
          >
            See how Wayheld travels differently
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
        </motion.div>
      </>
    </Section>
  );
}
