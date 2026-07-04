"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { memo, useRef } from "react";
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
          <circle
            cx="8"
            cy="5"
            r="2.6"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <path
            d="M3 13c.6-2.4 2.6-3.6 5-3.6S12.4 10.6 13 13"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      );
    case "wayheld":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden>
          <path
            d="M8 1.5c2 1.8 2 4.2 0 6-2-1.8-2-4.2 0-6ZM8 8.5c2 1.8 2 4.2 0 6-2-1.8-2-4.2 0-6Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <circle cx="8" cy="8" r="1.1" fill="currentColor" />
        </svg>
      );
    case "local":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden>
          <path
            d="M8 14s4.5-3.6 4.5-7A4.5 4.5 0 0 0 3.5 7c0 3.4 4.5 7 4.5 7Z"
            stroke="currentColor"
            strokeWidth="1.3"
          />
          <circle
            cx="8"
            cy="6.8"
            r="1.6"
            stroke="currentColor"
            strokeWidth="1.3"
          />
        </svg>
      );
    case "route":
      return (
        <svg viewBox="0 0 16 16" fill="none" className={common} aria-hidden>
          <path
            d="M4 13c0-3 8-4 8-7a3 3 0 0 0-6 0c0 1.6 2 2.2 2 3.4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
          <circle cx="4" cy="13" r="1.2" fill="currentColor" />
          <circle cx="12" cy="3" r="1.2" fill="currentColor" />
        </svg>
      );
  }
}

/**
 * Exact copy of the original premium collage layout, extracted into a reusable component.
 * It strictly maintains the same overlapping images, quote cards, shadows, and spacing.
 */
const EditorialCollage = memo(function EditorialCollage({
  mainImg,
  mainTag,
  mainTitle,
  subImg,
  subTag,
  subTitle,
  quote,
  author,
  detail,
}: {
  mainImg: string;
  mainTag: string;
  mainTitle: string;
  subImg: string;
  subTag: string;
  subTitle: string;
  quote: string;
  author: string;
  detail: string;
}) {
  return (
    <div className="relative h-[550px] w-full lg:h-[680px]">
      {/* Main large image */}
      <div className="absolute right-0 top-0 h-[360px] w-[90%] overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(51,51,47,0.3)] lg:h-[460px] lg:w-[85%] lg:rounded-[2.5rem] transform-gpu will-change-transform">
        <Image
          src={mainImg}
          alt={mainTitle}
          fill
          quality={85}
          sizes="(max-width: 1024px) 90vw, 55vw"
          className="object-cover transition-transform duration-[2s] hover:scale-105 will-change-transform"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-6 left-6 text-[#F4EFE6] lg:bottom-8 lg:left-8">
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-[#A8A69D] lg:text-[0.65rem]">
            {mainTag}
          </span>
          <h4 className="mt-1 font-display text-xl lg:mt-2 lg:text-2xl">
            {mainTitle}
          </h4>
        </div>
      </div>

      {/* Overlapping secondary image */}
      <div className="absolute left-0 top-[220px] z-10 h-[280px] w-[55%] overflow-hidden rounded-3xl shadow-[0_20px_40px_-10px_rgba(51,51,47,0.2)] lg:top-[300px] lg:h-[360px] lg:w-[50%] transform-gpu will-change-transform">
        <Image
          src={subImg}
          alt={subTitle}
          fill
          quality={85}
          sizes="(max-width: 1024px) 50vw, 30vw"
          className="object-cover transition-transform duration-[2s] hover:scale-105 will-change-transform"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-5 left-5 text-[#F4EFE6] lg:bottom-6 lg:left-6">
          <span className="text-[0.5rem] font-bold uppercase tracking-[0.16em] text-[#A8A69D] lg:text-[0.55rem]">
            {subTag}
          </span>
          <p className="mt-1 text-xs font-medium lg:text-sm">{subTitle}</p>
        </div>
      </div>

      {/* Floating Quote Box */}
      <div className="absolute bottom-0 right-0 z-20 w-[85%] rounded-3xl border border-[#D8D2C8] bg-white/95 p-6 shadow-2xl backdrop-blur-xl lg:bottom-8 lg:right-6 lg:w-[48%] lg:bg-white/90 lg:p-8 transform-gpu backface-hidden will-change-transform">
        <blockquote className="font-display text-base italic leading-relaxed text-[#33332F] lg:text-lg">
          “{quote}”
        </blockquote>
        <div className="mt-4 flex items-center gap-3 lg:mt-6 lg:gap-4">
          <span className="h-px w-6 bg-[#74876B] lg:w-8" />
          <p className="text-[0.6rem] font-bold uppercase tracking-widest text-[#74876B] lg:text-[0.65rem]">
            {author}
          </p>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-[#504F4A] lg:mt-5">
          {detail}
        </p>
      </div>
    </div>
  );
});

const COLLAGES = [
  <EditorialCollage
    key="0"
    mainImg="/images/travel-assets/05_scotland_cliffs.jpg"
    mainTag="Wild Coastline"
    mainTitle="Empty Cliffs"
    subImg="/images/travel-assets/06_forest_stairs.jpg"
    subTag="Ancient Paths"
    subTitle="The Quiet Forest"
    quote="The coastal cliffs and woodland paths are often overlooked by visitors following the usual routes."
    author="Wayheld AI"
    detail="Walk woodland paths where silence becomes part of the journey."
  />,
  <EditorialCollage
    key="1"
    mainImg="/images/travel-assets/02_bicycle.jpg"
    mainTag="Slow Travel"
    mainTitle="Village Routes"
    subImg="/images/how-wayheld-thinks/how-sub.webp"
    subTag="Local craft"
    subTitle="Quiet mornings"
    quote="Take the slower route through villages where locals still know every neighbour."
    author="Local Guide"
    detail="Wayheld draws on local knowledge to help you linger where everyday life quietly unfolds."
  />,
];

const Stage = memo(function Stage({
  stage,
  index,
  visual,
}: {
  stage: ThinkingStage;
  index: number;
  visual?: React.ReactNode;
}) {
  const isWayheld = stage.voice === "wayheld";
  const accent = isWayheld || stage.voice === "route";

  return (
    <motion.li
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
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

      <div className="pb-12 sm:pb-16 lg:pb-32">
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

      {/* Mobile Visual Flow (Interspersed) */}
      {visual && <div className="block w-full pb-16 lg:hidden">{visual}</div>}
    </motion.li>
  );
});

/**
 * "How Wayheld Thinks" — a scroll-driven narrative proving Wayheld reasons
 * rather than chats. Uses a natural scrolling column of repeated editorial
 * collages to eliminate whitespace and maintain exactly the same premium design language.
 */
export const HowWayheldThinks = memo(function HowWayheldThinks() {
  const reduceMotion = useReducedMotion();
  const spineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: spineRef,
    offset: ["start 70%", "end 60%"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <Section id="how" labelledBy="how-heading">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Title + Intro + Reasoning spine */}
        <div className="lg:col-span-5">
          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.85, ease: EASE_EXPO }}
            className="max-w-xl"
          >
            <p className={kicker}>
              <span className="h-px w-8 bg-[#74876B]/60" aria-hidden />
              {HOW_KICKER}
            </p>
            <h2 id="how-heading" className={`mt-6 ${sectionTitle}`}>
              {HOW_HEADLINE.lead}{" "}
              <span className="italic text-[#74876B]">
                {HOW_HEADLINE.accent}
              </span>
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
              className="absolute bottom-0 left-3 top-1.5 w-px origin-top bg-gradient-to-b from-[#74876B] via-[#74876B]/60 to-transparent sm:left-4 transform-gpu will-change-transform"
            />

            <ol className="relative">
              {THINKING_STAGES.map((stage, index) => {
                let visual = null;
                // Intersperse visual 0 after stage 1, and visual 1 after stage 3
                if (index === 1) visual = COLLAGES[0];
                if (index === 3) visual = COLLAGES[1];

                return (
                  <Stage
                    key={stage.label}
                    stage={stage}
                    index={index}
                    visual={visual}
                  />
                );
              })}
            </ol>
          </div>
        </div>

        {/* Right Column: Long Editorial Visual Cascade (Natural Scroll) */}
        <div className="hidden lg:block lg:col-span-7">
          {/* Matches the top offset of the spineRef (mt-8 lg:mt-10) to perfectly align visually */}
          <div className="flex flex-col gap-[200px] pl-8 mt-8 lg:mt-10">
            {COLLAGES.map((collage, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.85, ease: EASE_EXPO }}
              >
                {collage}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
});
