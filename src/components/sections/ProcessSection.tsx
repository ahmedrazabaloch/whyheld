"use client";

import { motion, type Variants } from "motion/react";
import { Section } from "@/components/ui";
import {
  containerVariants,
  riseVariants,
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

/** Mobile-only straight rail that fills the remaining row height. */
function MobileConnector({ toBottom = false }: { toBottom?: boolean }) {
  return (
    <motion.div
      aria-hidden
      variants={{
        hidden: { scaleY: 0, opacity: 0 },
        show: {
          scaleY: 1,
          opacity: 1,
          transition: { duration: 1.1, ease: "easeInOut" },
        },
      }}
      style={{ originY: 0 }}
      className={`w-px flex-1 bg-[#74876B] md:hidden ${toBottom ? "min-h-16" : ""}`}
    />
  );
}

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
        <div className="relative z-10 col-start-1 row-start-1 flex h-full flex-col items-center md:col-start-2">
          <motion.div
            variants={riseVariants}
            className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#74876B] bg-[#F4EFE6] font-display text-sm text-[#74876B] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(116,135,107,0.4)] md:h-12 md:w-12 md:text-lg"
          >
            {PROCESS_STEPS[0].step}
          </motion.div>

          <MobileConnector />

          {/* Desktop Path (Bulges Right) */}
          <div className="pointer-events-none absolute top-12 bottom-0 left-0 hidden w-full md:block">
            <svg
              className="h-full w-full overflow-visible"
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
          </div>
        </div>

        {/* Text 1 */}
        <motion.div
          variants={riseVariants}
          className="col-start-2 row-start-1 pb-16 pt-1 text-left md:col-start-1 md:pb-32 md:pt-2 md:text-right"
        >
          <h3 className="mb-4 font-display text-xl text-[#33332F] sm:text-2xl">
            {PROCESS_STEPS[0].title}
          </h3>
          <p className="text-sm leading-relaxed text-[#504F4A] md:ml-auto md:max-w-md">
            {PROCESS_STEPS[0].description}
          </p>
        </motion.div>

        <div className="col-start-3 row-start-1 hidden md:block" />

        {/* ROW 2: Step 02 */}
        <div className="col-start-1 row-start-2 hidden md:block" />

        <div className="relative z-10 col-start-1 row-start-2 flex h-full flex-col items-center md:col-start-2">
          <motion.div
            variants={riseVariants}
            className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#74876B] bg-[#F4EFE6] font-display text-sm text-[#74876B] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(116,135,107,0.4)] md:h-12 md:w-12 md:text-lg"
          >
            {PROCESS_STEPS[1].step}
          </motion.div>

          <MobileConnector />

          {/* Desktop Path (Bulges Left) */}
          <div className="pointer-events-none absolute top-12 bottom-0 left-0 hidden w-full md:block">
            <svg
              className="h-full w-full overflow-visible"
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
          </div>
        </div>

        {/* Text 2 */}
        <motion.div
          variants={riseVariants}
          className="col-start-2 row-start-2 pb-16 pt-1 text-left md:col-start-3 md:pb-32 md:pt-2"
        >
          <h3 className="mb-4 font-display text-xl text-[#33332F] sm:text-2xl">
            {PROCESS_STEPS[1].title}
          </h3>
          <p className="text-sm leading-relaxed text-[#504F4A] md:max-w-md">
            {PROCESS_STEPS[1].description}
          </p>
        </motion.div>

        {/* ROW 3: Step 03 */}
        <div className="relative z-10 col-start-1 row-start-3 flex h-full flex-col items-center md:col-start-2">
          <motion.div
            variants={riseVariants}
            className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#74876B] bg-[#74876B] font-display text-sm text-[#F4EFE6] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_15px_rgba(116,135,107,0.4)] md:h-12 md:w-12 md:text-lg"
          >
            {PROCESS_STEPS[2].step}
          </motion.div>

          <MobileConnector toBottom />
        </div>

        {/* Text 3 */}
        <motion.div
          variants={riseVariants}
          className="col-start-2 row-start-3 pb-8 pt-1 text-left md:col-start-1 md:pt-2 md:text-right"
        >
          <h3 className="mb-4 font-display text-xl text-[#33332F] sm:text-2xl">
            {PROCESS_STEPS[2].title}
          </h3>
          <p className="text-sm leading-relaxed text-[#504F4A] md:ml-auto md:max-w-md">
            {PROCESS_STEPS[2].description}
          </p>
        </motion.div>

        <div className="col-start-3 row-start-3 hidden md:block" />
      </motion.div>
    </Section>
  );
}
