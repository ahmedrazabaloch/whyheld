"use client";

import { motion } from "motion/react";
import { ResilientImage } from "@/components/hero/ResilientImage";
import { Section } from "@/components/ui";
import {
  EASE_EXPO,
  kicker,
  sectionTitle,
  surfaces,
} from "@/lib/design";
import { featureHref } from "@/lib/auth/redirect";
import {
  JOURNEYS,
  JOURNEYS_HEADLINE,
  JOURNEYS_INTRO,
  JOURNEYS_KICKER,
  type Journey,
} from "./journeys.config";

function JourneyCard({ journey, index }: { journey: Journey; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.85, ease: EASE_EXPO, delay: (index % 2) * 0.08 }}
      className={`group relative flex flex-col overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#33332F]/5 ${surfaces.card}`}
    >
      {/* Image */}
      <div className="relative aspect-16/11 w-full overflow-hidden">
        <ResilientImage
          src={journey.image}
          alt={journey.alt}
          fill
          sizes="(max-width: 768px) 92vw, (max-width: 1280px) 46vw, 580px"
          className="object-cover transition-transform duration-1400 ease-out-expo group-hover:scale-105"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent"
        />

        {/* Duration badge */}
        <span className="absolute left-4 top-4 rounded-full border border-mist-50/25 bg-forest-950/45 px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-mist-100 backdrop-blur-md">
          {journey.duration}
        </span>

        {/* Region + name over image */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[#74876B]">
            {journey.region}
          </p>
          <h3 className="mt-1 font-display text-2xl leading-tight text-white sm:text-3xl">
            {journey.name}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-brand-text-secondary">
          {journey.style}
        </p>
        <p className="mt-3 text-base leading-relaxed text-brand-text-secondary">
          {journey.summary}
        </p>

        {/* Highlights */}
        <ul className="mt-5 flex flex-wrap gap-2">
          {journey.highlights.map((highlight) => (
            <li
              key={highlight}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-text-primary/5 px-2.5 py-1 text-[0.68rem] font-medium tracking-wide text-brand-text-secondary"
            >
              <span className="h-1 w-1 rounded-full bg-[#74876B]" aria-hidden />
              {highlight}
            </li>
          ))}
        </ul>

        {/* Footer link */}
        <div className="mt-6 flex items-center justify-between border-t border-[#D8D2C8] pt-5">
          <span className="text-[0.7rem] uppercase tracking-[0.18em] text-brand-text-secondary">
            Shaped by Wayheld
          </span>
          <a
            href={featureHref("/journeys")}
            className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-[#33332F] transition-colors hover:text-[#74876B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#74876B]"
            aria-label={`Explore ${journey.name}`}
          >
            Explore
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-0.5"
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
        </div>
      </div>
    </motion.article>
  );
}

/**
 * "Featured Journeys" — an editorial showcase grid in the same design
 * language as the hero. Two columns on desktop, single column on mobile,
 * with elegant image-zoom hover and scroll-reveal.
 */
export function FeaturedJourneys() {
  return (
    <Section
      id="journeys"
      labelledBy="journeys-heading"

    >
      <>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.85, ease: EASE_EXPO }}
          className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <p className={kicker}>
              <span className="h-px w-8 bg-[#74876B]/60" aria-hidden />
              {JOURNEYS_KICKER}
            </p>
            <h2 id="journeys-heading" className={`mt-6 ${sectionTitle}`}>
              {JOURNEYS_HEADLINE.lead}{" "}
              <span className="italic text-[#74876B]">
                {JOURNEYS_HEADLINE.accent}
              </span>
              {JOURNEYS_HEADLINE.tail}
            </h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-[#504F4A] sm:text-right">
            {JOURNEYS_INTRO}
          </p>
        </motion.div>

        {/* Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:mt-16 lg:gap-7">
          {JOURNEYS.map((journey, index) => (
            <JourneyCard key={journey.id} journey={journey} index={index} />
          ))}
        </div>
      </>
    </Section>
  );
}
