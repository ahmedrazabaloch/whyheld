"use client";

import { motion } from "motion/react";
import { Section } from "@/components/ui";
import { containerVariants, riseVariants, EASE_EXPO } from "@/lib/design";

const STATS = [
  { value: "120+", label: "Slow Regions" },
  { value: "450", label: "Curated Places" },
  { value: "85", label: "Local Experiences" },
  { value: "4", label: "Travel Styles" },
];

export function StatisticsSection() {
  return (
    <section
      id="statistics"
      className="relative isolate w-full overflow-hidden bg-[#74876B] py-16 text-[#F4EFE6] sm:py-20 lg:py-24 border-y border-[rgba(244,239,230,0.15)]"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10"
      >
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={riseVariants}
              className="flex flex-col items-center text-center sm:items-start sm:text-left"
            >
              <span className="font-display text-5xl sm:text-6xl lg:text-7xl text-[#F4EFE6] font-light tracking-tight">
                {stat.value}
              </span>
              <div className="mt-4 flex flex-col items-center sm:items-start">
                <span className="mb-3 h-px w-6 bg-[rgba(244,239,230,0.3)]" aria-hidden />
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-[rgba(244,239,230,0.95)] font-bold">
                  {stat.label}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
