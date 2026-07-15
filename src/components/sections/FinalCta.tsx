"use client";

import { motion } from "motion/react";
import { GrainOverlay, SectionDivider } from "@/components/ui";
import { buttonStyles, EASE_EXPO } from "@/lib/design";

/**
 * Headline alternatives considered (active first). Kept here so the team can
 * swap the closing line without touching layout.
 *
 *  - "Travel deeper. Leave lighter."            ← active
 *  - "The world doesn't need another itinerary."
 *  - "Travel isn't something to complete."
 *  - "Go slower. See further."
 *  - "The places remember how you arrive."
 */
const DEFAULT_HEADLINE = {
  lead: "Travel deeper.",
  accent: "Leave lighter",
  tail: ".",
};

const DEFAULT_SUB =
  "Begin a journey built around meaning, not mileage — and let the world reveal itself at the pace it was meant to.";

export interface FinalCtaProps {
  headlineLead?: string;
  headlineAccent?: string;
  headlineTail?: string;
  subtitle?: string;
  buttonText?: string;
}

export function FinalCta({
  headlineLead = DEFAULT_HEADLINE.lead,
  headlineAccent = DEFAULT_HEADLINE.accent,
  headlineTail = DEFAULT_HEADLINE.tail,
  subtitle = DEFAULT_SUB,
  buttonText = "Begin Your Journey",
}: FinalCtaProps) {
  const words = [...headlineLead.split(" "), "__ACCENT__"];
  return (
    <section
      id="start"
      aria-labelledby="cta-heading"
      className="relative isolate w-full overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28"
      style={{ backgroundColor: "#5b6c53" }}
    >
      <GrainOverlay opacity={0.07} />
      <SectionDivider />

      <div className="mx-auto w-full max-w-4xl px-5 text-center sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: EASE_EXPO }}
          className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.3em] text-[rgba(244,239,230,0.70)]"
        >
          <span className="h-px w-8 bg-[rgba(244,239,230,0.15)]" aria-hidden />
          Your journey begins here
          <span className="h-px w-8 bg-[rgba(244,239,230,0.15)]" aria-hidden />
        </motion.p>

        <h2
          id="cta-heading"
          className="mt-8 font-display text-balance text-[clamp(2.75rem,8vw,6rem)] font-light leading-[0.98] tracking-[-0.02em] text-[#F4EFE6]"
        >
          <motion.span
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ staggerChildren: 0.12 }}
            className="inline"
          >
            {words.map((word, i) => (
              <span
                key={i}
                className="inline-block overflow-hidden pb-[0.1em] align-bottom"
              >
                <motion.span
                  variants={{
                    hidden: { y: "110%" },
                    show: {
                      y: "0%",
                      transition: { duration: 0.9, ease: EASE_EXPO },
                    },
                  }}
                  className={`inline-block ${word === "__ACCENT__" ? "italic text-[#D8D2C8]" : ""}`}
                >
                  {word === "__ACCENT__" ? headlineAccent : word}
                  {word === "__ACCENT__" ? headlineTail : "\u00A0"}
                </motion.span>
              </span>
            ))}
          </motion.span>
        </h2>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: EASE_EXPO, delay: 0.3 }}
          className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-[rgba(244,239,230,0.88)] sm:text-lg"
        >
          {subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: EASE_EXPO, delay: 0.45 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href="/login"
            className={`${buttonStyles.primary} h-14 px-8 text-sm`}
          >
            {buttonText}
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
          <a
            href="#journeys"
            className="group inline-flex h-13 items-center justify-center gap-2 rounded-full border border-[rgba(244,239,230,0.45)] px-7 py-3.5 text-sm font-medium text-[#F4EFE6] transition-colors duration-300 hover:border-[#F4EFE6]/40 hover:bg-[rgba(244,239,230,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4EFE6]/40"
          >
            Explore journeys first
          </a>
          {/* secondary link kept inline: borderless variant unique to CTA */}
        </motion.div>
      </div>
    </section>
  );
}
