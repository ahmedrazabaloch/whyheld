"use client";

import { motion } from "motion/react";
import { ResilientImage } from "@/components/hero/ResilientImage";
import { GrainOverlay } from "@/components/ui";
import { EASE_EXPO, riseVariants } from "@/lib/design";

interface PageHeroProps {
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  kicker?: string;
}

export function PageHero({ title, subtitle, image, alt, kicker }: PageHeroProps) {
  return (
    <section className="relative isolate flex h-[80vh] min-h-[600px] w-full flex-col overflow-hidden bg-[#74876B]">
      <div className="absolute inset-0 z-0">
        <ResilientImage
          src={image}
          alt={alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />
        <GrainOverlay opacity={0.15} />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center px-5 text-center sm:px-6 lg:px-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.2 },
            },
          }}
          className="flex max-w-3xl flex-col items-center"
        >
          {kicker && (
            <motion.p
              variants={riseVariants}
              className="mb-6 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.3em] text-[#F4EFE6]/80"
            >
              {kicker}
            </motion.p>
          )}
          <motion.h1
            variants={riseVariants}
            className="font-display text-4xl leading-[1.1] tracking-tight text-[#F4EFE6] sm:text-5xl md:text-6xl"
          >
            {title}
          </motion.h1>
          <motion.p
            variants={riseVariants}
            className="mt-6 max-w-2xl text-base leading-relaxed text-[#F4EFE6]/90 sm:text-lg md:text-xl"
          >
            {subtitle}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
