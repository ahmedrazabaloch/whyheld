"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { containerVariants, riseVariants } from "@/lib/design";

const STATS = [
  { value: "120+", label: "Slow Regions" },
  { value: "450", label: "Curated Places" },
  { value: "85", label: "Local Experiences" },
  { value: "4", label: "Travel Styles" },
];

function AnimatedCounter({ value }: { value: string }) {
  const hasPlus = value.includes("+");
  const numValue = parseInt(value.replace(/\D/g, ""), 10);
  
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(reduceMotion ? numValue : 0);

  useEffect(() => {
    if (reduceMotion) return;
    if (isInView) {
      let animationFrame: number;
      const duration = 1800;
      const startTime = performance.now();

      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // easeOutQuint
        const easeProgress = 1 - Math.pow(1 - progress, 5);
        
        setDisplayValue(Math.floor(easeProgress * numValue));
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(step);
        }
      };
      animationFrame = requestAnimationFrame(step);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, numValue, reduceMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {displayValue}{hasPlus ? "+" : ""}
    </span>
  );
}

function StatisticCard({ stat }: { stat: { value: string; label: string } }) {
  return (
    <motion.div
      variants={riseVariants}
      className="group relative flex h-full w-full flex-col items-center justify-center text-center px-4 py-8 sm:p-10 rounded-2xl bg-[#F4EFE6] shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[rgba(51,51,47,0.04)] lg:transition-all lg:duration-250 lg:ease-out lg:hover:-translate-y-1 lg:hover:shadow-[0_16px_40px_rgba(0,0,0,0.12)]"
    >
      <span className="font-display text-4xl min-[400px]:text-5xl sm:text-6xl text-[#33332F] font-light tracking-tight">
        <AnimatedCounter value={stat.value} />
      </span>
      <div className="mt-4 sm:mt-5 flex flex-col items-center">
        <span className="mb-3 sm:mb-4 h-px w-6 bg-[#74876B]/30 transition-all duration-300 lg:group-hover:w-10 lg:group-hover:bg-[#74876B]/60" aria-hidden />
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
      className="relative isolate w-full bg-[#74876B] py-16 sm:py-20 lg:py-24 border-y border-[rgba(244,239,230,0.15)]"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-10"
      >
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {STATS.map((stat) => (
            <StatisticCard key={stat.label} stat={stat} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
