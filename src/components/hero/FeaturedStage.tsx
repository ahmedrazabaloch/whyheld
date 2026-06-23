"use client";

import { AnimatePresence, motion } from "motion/react";
import { ResilientImage } from "./ResilientImage";
import type { ShowcaseDestination } from "./types";

interface FeaturedStageProps {
  destination: ShowcaseDestination;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The large cinematic stage for the currently featured destination. Images
 * crossfade with a slow Ken-Burns drift; the meta block slides up beneath a
 * gradient scrim. Designed to be the emotional centre of the hero.
 */
export function FeaturedStage({ destination }: FeaturedStageProps) {
  return (
    <div className="relative aspect-4/5 w-full overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#2A2926] shadow-[0_50px_120px_-50px_rgba(0,0,0,0.95)] sm:aspect-3/4 lg:h-[70vh] lg:min-h-[600px] lg:max-h-[850px] lg:w-full">
      <AnimatePresence>
        <motion.div
          key={destination.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="absolute inset-0"
        >
          <ResilientImage
            src={destination.image}
            alt={destination.alt}
            fill
            priority
            sizes="(max-width: 1024px) 92vw, 46vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Subtle readability gradient at bottom only */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#2A2926]/80 to-transparent pointer-events-none"
      />

      {/* Theme tag */}
      <div className="absolute left-6 top-6 z-20">
        <AnimatePresence mode="wait">
          <motion.span
            key={destination.id}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#2A2926] px-3.5 py-1.5 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-mist-50"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sun-400" aria-hidden />
            {destination.theme}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Meta block */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={destination.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#2A2926]/95 p-6 shadow-xl"
          >

            <div className="relative flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-sun-300">
                  {destination.region}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[0.62rem] font-medium uppercase tracking-[0.16em] text-mist-100 backdrop-blur-sm border border-white/5">
                  <span className="h-1 w-1 rounded-full bg-sun-400" aria-hidden />
                  {destination.pace}
                </span>
              </div>

              <h3 className="font-display text-2xl sm:text-3xl leading-tight text-white tracking-tight">
                {destination.name}
              </h3>

              <p className="text-sm leading-relaxed text-[#F4EFE6]/90 font-light mt-1.5">
                {destination.caption}
              </p>

              {destination.tags && destination.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {destination.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-white/10 bg-[#33332F] px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-white transition-colors hover:bg-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
