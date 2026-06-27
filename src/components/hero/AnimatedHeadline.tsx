"use client";

import { motion } from "motion/react";
import type { Headline } from "./types";
import { wordVariants } from "./motion";

interface AnimatedHeadlineProps {
  headline: Headline;
}

/** Splits a string into mask-reveal words. */
function MaskedWords({ text, accent = false }: { text: string; accent?: boolean }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span
            variants={wordVariants}
            className={`inline-block ${accent ? "italic text-[#EAE4D8]" : ""}`}
          >
            {word}
            {/* keep natural spacing between words */}
            &nbsp;
          </motion.span>
        </span>
      ))}
    </>
  );
}

/**
 * Large editorial headline with a per-word mask reveal. The accent phrase is
 * rendered in italic serif and the warm sunlight accent color.
 */
export function AnimatedHeadline({ headline }: AnimatedHeadlineProps) {
  return (
    <h1 className="font-display text-balance text-[clamp(2.75rem,7vw,5.5rem)] font-light leading-[0.98] tracking-[-0.02em] text-[#F4EFE6]">
      <MaskedWords text={headline.lead} />
      <MaskedWords text={headline.accent} accent />
      <span className="sr-only">{headline.tail}</span>
      <span aria-hidden className="text-[#F4EFE6]">
        {headline.tail.trim()}
      </span>
    </h1>
  );
}
