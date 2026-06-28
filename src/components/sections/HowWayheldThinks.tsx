"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import Image from "next/image";
import { Section } from "@/components/ui";
import { EASE_EXPO, kicker, leadParagraph, sectionTitle } from "@/lib/design";
import {
  HOW_HEADLINE,
  HOW_INTRO,
  HOW_KICKER,
  THINKING_STAGES,
  type ThinkingStage,
} from "./how-thinks.config";

/** Small glyph per voice — abstract, not a technical icon. */
function VoiceMark({ voice }: { voice: ThinkingStage["voice"] }) {
  const common = "h-4 w-4";
  switch (voice) {
    case "you":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden>
          <circle cx="8" cy="5" r="2.6" stroke="currentColor" strokeWidth="1.3" />
          <path d="M3 13c.6-2.4 2.6-3.6 5-3.6S12.4 10.6 13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case "wayheld":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden>
          <path d="M8 1.5c2 1.8 2 4.2 0 6-2-1.8-2-4.2 0-6ZM8 8.5c2 1.8 2 4.2 0 6-2-1.8-2-4.2 0-6Z" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="8" cy="8" r="1.1" fill="currentColor" />
        </svg>
      );
    case "local":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden>
          <path d="M8 14s4.5-3.6 4.5-7A4.5 4.5 0 0 0 3.5 7c0 3.4 4.5 7 4.5 7Z" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="8" cy="6.8" r="1.6" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "route":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden>
          <path d="M4 13c0-3 8-4 8-7a3 3 0 0 0-6 0c0 1.6 2 2.2 2 3.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="4" cy="13" r="1.2" fill="currentColor" />
          <circle cx="12" cy="3" r="1.2" fill="currentColor" />
        </svg>
      );
  }
}

function Stage({ stage, index }: { stage: ThinkingStage; index: number }) {
  const isWayheld = stage.voice === "wayheld";
  const accent = isWayheld || stage.voice === "route";

  return (
    <motion.li
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.85, ease: EASE_EXPO, delay: index * 0.05 }}
      className="relative pl-12 sm:pl-16"
    >
      {/* Node on the spine */}
      <span
        className={`absolute left-3 top-1.5 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border sm:left-4 ${
          accent
            ? "border-[#74876B]/70 bg-[#74876B]/15 text-[#74876B]"
            : "border-[#D8D2C8] bg-white text-[#504F4A]"
        }`}
      >
        <VoiceMark voice={stage.voice} />
      </span>

      <div className="pb-14 sm:pb-16">
        <p
          className={`text-[0.7rem] font-medium uppercase tracking-[0.22em] ${
            accent ? "text-brand-btn-primary" : "text-brand-text-secondary"
          }`}
        >
          {stage.label}
        </p>

        <p
          className={`mt-3 max-w-2xl font-display leading-snug text-balance ${
            isWayheld
              ? "text-2xl text-[#33332F] sm:text-[1.75rem]"
              : "text-xl text-[#33332F] sm:text-2xl"
          } ${stage.voice === "you" ? "italic text-[#504F4A]" : ""}`}
        >
          {stage.line}
        </p>

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-text-secondary sm:text-base">
          {stage.detail}
        </p>

        {stage.signals && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {stage.signals.map((signal) => (
              <li
                key={signal}
                className="rounded-full border border-brand-border bg-brand-text-primary/5 px-2.5 py-1 text-[0.68rem] font-medium tracking-wide text-brand-text-secondary"
              >
                {signal}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.li>
  );
}

/**
 * "How Wayheld Thinks" — a scroll-driven narrative proving Wayheld reasons
 * rather than chats. A vertical spine connects four beats of thought, with a
 * progress line that draws itself as the reader scrolls.
 */
export function HowWayheldThinks() {
  const reduceMotion = useReducedMotion();
  const spineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: spineRef,
    offset: ["start 70%", "end 60%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <Section
      id="how"
      labelledBy="how-heading"

    >
      <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Title + Intro + Reasoning spine */}
        <div className="lg:col-span-5">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.85, ease: EASE_EXPO }}
            className="max-w-xl"
          >
            <p className={kicker}>
              <span className="h-px w-8 bg-[#74876B]/60" aria-hidden />
              {HOW_KICKER}
            </p>
            <h2 id="how-heading" className={`mt-6 ${sectionTitle}`}>
              {HOW_HEADLINE.lead}{" "}
              <span className="italic text-[#74876B]">{HOW_HEADLINE.accent}</span>
              {HOW_HEADLINE.tail}
            </h2>
            <p className={`mt-6 max-w-xl ${leadParagraph}`}>{HOW_INTRO}</p>
          </motion.div>

          {/* Reasoning spine */}
          <div ref={spineRef} className="relative mt-8 lg:mt-10">
            {/* Track */}
            <span
              aria-hidden
              className="absolute bottom-0 left-3 top-1.5 w-px bg-[#D8D2C8] sm:left-4"
            />
            {/* Progress line */}
            <motion.span
              aria-hidden
              style={{ scaleY: reduceMotion ? 1 : lineScale }}
              className="absolute bottom-0 left-3 top-1.5 w-px origin-top bg-linear-to-b from-[#74876B] via-[#74876B]/60 to-transparent sm:left-4"
            />

            <ol className="relative">
              {THINKING_STAGES.map((stage, index) => (
                <Stage key={stage.label} stage={stage} index={index} />
              ))}
            </ol>
          </div>
        </div>

        {/* Right Column: Premium Editorial Travel Imagery (Sticky collage) */}
        <div className="hidden lg:col-span-7 lg:block">
          <div className="sticky top-32 pl-8">
            <div className="relative h-[680px] w-full">
              {/* Main large image */}
              <div className="absolute top-0 right-0 h-[460px] w-[85%] overflow-hidden rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(51,51,47,0.3)]">
                <Image
                  src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200"
                  alt="Misty cliffs and castle ruins in St Andrews, Scotland"
                  fill
                  sizes="55vw"
                  className="object-cover transition-transform duration-[2s] hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                <div className="absolute bottom-8 left-8 text-[#F4EFE6]">
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#A8A69D]">
                    Aberdeenshire cliffs
                  </span>
                  <h4 className="mt-2 font-display text-2xl">The end of the Neuk path</h4>
                </div>
              </div>

              {/* Overlapping secondary image */}
              <div className="absolute top-[300px] left-0 z-10 h-[360px] w-[50%] overflow-hidden rounded-3xl shadow-[0_20px_40px_-10px_rgba(51,51,47,0.2)]">
                <Image
                  src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80&w=800"
                  alt="Historic quiet harbour in Fife, Scotland"
                  fill
                  sizes="30vw"
                  className="object-cover transition-transform duration-[2s] hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 text-[#F4EFE6]">
                  <span className="text-[0.55rem] font-bold uppercase tracking-[0.16em] text-[#A8A69D]">
                    Fife coastline
                  </span>
                  <p className="mt-1 text-sm font-medium">Fishing villages</p>
                </div>
              </div>

              {/* Floating Quote Box */}
              <div className="absolute bottom-8 right-6 z-20 w-[48%] rounded-3xl border border-[#D8D2C8] bg-white/90 p-8 shadow-2xl backdrop-blur-xl">
                <blockquote className="font-display text-lg italic leading-relaxed text-[#33332F]">
                  “The fishing villages of Fife are quiet, and the harbour cafés keep their own hours.”
                </blockquote>
                <div className="mt-6 flex items-center gap-4">
                  <span className="h-px w-8 bg-[#74876B]" />
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#74876B]">
                    Local Guide
                  </p>
                </div>
                <p className="mt-5 text-xs leading-relaxed text-[#504F4A]">
                  Wayheld designs around context, routing you past St Monans and Crail for heritage stays and local stories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
    </Section>
  );
}
