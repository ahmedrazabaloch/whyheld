"use client";

import { motion, useInView, useReducedMotion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect, useRef } from "react";
import { containerVariants, riseVariants, EASE_EXPO } from "@/lib/design";

const STATS = [
  { value: "120+", label: "Slow Regions" },
  { value: "450", label: "Curated Places" },
  { value: "85", label: "Local Experiences" },
  { value: "4", label: "Travel Styles" },
];

function AnimatedCounter({ value, index }: { value: string; index: number }) {
  const hasPlus = value.includes("+");
  const numValue = parseInt(value.replace(/\D/g, ""), 10);
  
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();
  
  const count = useMotionValue(0);
  
  // Format the raw number with commas
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());
  // Append '+' if the original string had it
  const displayValue = useTransform(rounded, (latest) => `${latest}${hasPlus ? "+" : ""}`);

  useEffect(() => {
    if (reduceMotion) {
      count.set(numValue);
      return;
    }
    
    if (isInView) {
      console.log(`AnimatedCounter ${index} starting with delay:`, index * 0.15);
      const controls = animate(count, numValue, {
        duration: 2.5, // Extended duration to make the ease-out very obvious
        ease: EASE_EXPO,
        delay: index * 0.15, // Syncs with the staggered card entrance
      });
      return () => controls.stop();
    }
  }, [isInView, numValue, reduceMotion, index, count]);

  return (
    <motion.span ref={ref} className="tabular-nums">
      {displayValue}
    </motion.span>
  );
}

function StatisticCard({ stat, index }: { stat: { value: string; label: string }; index: number }) {
  return (
    <motion.div
      variants={riseVariants}
      className="group relative flex h-full w-full flex-col items-center justify-center text-center px-4 py-8 sm:p-10 rounded-2xl bg-[#F4EFE6] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[rgba(51,51,47,0.04)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(116,135,107,0.15)]"
    >
      <span className="font-display text-4xl min-[400px]:text-5xl sm:text-6xl text-[#33332F] font-light tracking-tight">
        <AnimatedCounter value={stat.value} index={index} />
      </span>
      <div className="mt-4 sm:mt-5 flex flex-col items-center">
        <span className="mb-3 sm:mb-4 h-px w-6 bg-[#74876B]/30 transition-all duration-300 group-hover:w-10 group-hover:bg-[#74876B]/60" aria-hidden />
        <span className="text-[0.6rem] sm:text-[0.65rem] uppercase tracking-[0.2em] text-[#74876B] font-bold">
          {stat.label}
        </span>
      </div>
    </motion.div>
  );
}

export function StatisticsSection() {
  return (
    <section
      id="statistics"
      className="relative isolate w-full bg-[#74876B] py-12 sm:py-16 lg:py-20 border-y border-[rgba(244,239,230,0.15)]"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10"
      >
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {STATS.map((stat, index) => (
            <StatisticCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
