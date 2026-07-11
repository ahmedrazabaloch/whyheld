"use client";

import { motion, type Variants } from "motion/react";
import { Section } from "@/components/ui";
import {
  containerVariants,
  riseVariants,
  EASE_EXPO,
  kicker,
  sectionTitle,
} from "@/lib/design";

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Leave the checklist behind",
    description:
      "A true sense of place emerges when you stop rushing between landmarks. Letting go of the itinerary leaves space for the quiet moments that give a journey its meaning.",
  },
  {
    step: "02",
    title: "Follow curiosity, not schedules",
    description:
      "Rigid plans leave little room for the world to surprise you. The most rewarding routes unfold naturally, guided by local context and an openness to the longer path.",
  },
  {
    step: "03",
    title: "Slow down enough to belong",
    description:
      "You cannot understand a community by simply passing through it. Staying longer allows you to learn the rhythm of a street, share unhurried conversations, and leave with lasting relationships.",
  },
];

const pathVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.5, ease: "easeInOut" },
  },
};

export function ProcessSection() {
  return (
    <Section id="process" className="bg-[#F4EFE6] overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-3xl mb-16 lg:mb-24"
      >
        <motion.p variants={riseVariants} className={kicker}>
          <span className="h-px w-8 bg-[#74876B]/60" aria-hidden />
          How it works
        </motion.p>
        <motion.h2 variants={riseVariants} className={`mt-6 ${sectionTitle}`}>
          The path to{" "}
          <span className="italic text-[#74876B]">meaningful travel.</span>
        </motion.h2>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        className="grid grid-cols-[3rem_1fr] md:grid-cols-[1fr_4rem_1fr] gap-x-6 md:gap-x-12 max-w-5xl mx-auto"
      >
        {/* ROW 1: Step 01 */}
        {/* Node 1 & Path to Node 2 */}
        <div className="col-start-1 md:col-start-2 row-start-1 flex flex-col items-center relative z-10">
          <motion.div
            variants={riseVariants}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#74876B] bg-[#F4EFE6] flex items-center justify-center text-[#74876B] font-display text-sm md:text-lg z-10 shrink-0 hover:scale-110 hover:shadow-[0_0_15px_rgba(116,135,107,0.4)] transition-all duration-300"
          >
            {PROCESS_STEPS[0].step}
          </motion.div>

          <div className="w-full absolute top-10 md:top-12 bottom-0 left-0 -z-10">
            {/* Desktop Path (Bulges Right) */}
            <svg
              className="hidden md:block w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <motion.path
                variants={pathVariants}
                d="M 50 0 C 300 50, 300 50, 50 100"
                fill="none"
                stroke="#74876B"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* Mobile Path (Bulges Left) */}
            <svg
              className="block md:hidden w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <motion.path
                variants={pathVariants}
                d="M 50 0 C -100 50, -100 50, 50 100"
                fill="none"
                stroke="#74876B"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        {/* Text 1 */}
        <motion.div
          variants={riseVariants}
          className="col-start-2 md:col-start-1 row-start-1 text-left md:text-right pb-16 md:pb-32 pt-1 md:pt-2"
        >
          <h3 className="font-display text-xl text-[#33332F] sm:text-2xl mb-4">
            {PROCESS_STEPS[0].title}
          </h3>
          <p className="text-sm leading-relaxed text-[#504F4A] md:ml-auto md:max-w-md">
            {PROCESS_STEPS[0].description}
          </p>
        </motion.div>

        <div className="hidden md:block col-start-3 row-start-1" />

        {/* ROW 2: Step 02 */}
        <div className="hidden md:block col-start-1 row-start-2" />

        {/* Node 2 & Path to Node 3 */}
        <div className="col-start-1 md:col-start-2 row-start-2 flex flex-col items-center relative z-10">
          <motion.div
            variants={riseVariants}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#74876B] bg-[#F4EFE6] flex items-center justify-center text-[#74876B] font-display text-sm md:text-lg z-10 shrink-0 hover:scale-110 hover:shadow-[0_0_15px_rgba(116,135,107,0.4)] transition-all duration-300"
          >
            {PROCESS_STEPS[1].step}
          </motion.div>

          <div className="w-full absolute top-10 md:top-12 bottom-0 left-0 -z-10">
            {/* Desktop Path (Bulges Left) */}
            <svg
              className="hidden md:block w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <motion.path
                variants={pathVariants}
                d="M 50 0 C -200 50, -200 50, 50 100"
                fill="none"
                stroke="#74876B"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {/* Mobile Path (Bulges Left slightly different) */}
            <svg
              className="block md:hidden w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <motion.path
                variants={pathVariants}
                d="M 50 0 C -80 30, -80 70, 50 100"
                fill="none"
                stroke="#74876B"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        {/* Text 2 */}
        <motion.div
          variants={riseVariants}
          className="col-start-2 md:col-start-3 row-start-2 text-left pb-16 md:pb-32 pt-1 md:pt-2"
        >
          <h3 className="font-display text-xl text-[#33332F] sm:text-2xl mb-4">
            {PROCESS_STEPS[1].title}
          </h3>
          <p className="text-sm leading-relaxed text-[#504F4A] md:max-w-md">
            {PROCESS_STEPS[1].description}
          </p>
        </motion.div>

        {/* ROW 3: Step 03 */}
        {/* Node 3 (No Path) */}
        <div className="col-start-1 md:col-start-2 row-start-3 flex flex-col items-center relative z-10">
          <motion.div
            variants={riseVariants}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#74876B] bg-[#74876B] flex items-center justify-center text-[#F4EFE6] font-display text-sm md:text-lg z-10 shrink-0 hover:scale-110 hover:shadow-[0_0_15px_rgba(116,135,107,0.4)] transition-all duration-300"
          >
            {PROCESS_STEPS[2].step}
          </motion.div>
        </div>

        {/* Text 3 */}
        <motion.div
          variants={riseVariants}
          className="col-start-2 md:col-start-1 row-start-3 text-left md:text-right pb-8 pt-1 md:pt-2"
        >
          <h3 className="font-display text-xl text-[#33332F] sm:text-2xl mb-4">
            {PROCESS_STEPS[2].title}
          </h3>
          <p className="text-sm leading-relaxed text-[#504F4A] md:ml-auto md:max-w-md">
            {PROCESS_STEPS[2].description}
          </p>
        </motion.div>

        <div className="hidden md:block col-start-3 row-start-3" />
      </motion.div>
    </Section>
  );
}
