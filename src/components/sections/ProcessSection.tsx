"use client";

import { motion } from "motion/react";
import { Section } from "@/components/ui";
import { containerVariants, riseVariants, EASE_EXPO, kicker, sectionTitle, leadParagraph } from "@/lib/design";

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Tell us how you travel",
    description: "Share your pace, interests, and how you prefer to connect with a place. Wayheld learns what matters to you without reducing your travel style to a checklist.",
  },
  {
    step: "02",
    title: "Wayheld crafts your journey",
    description: "Using AI and curated local knowledge, we build a thoughtful route focused on deeper connections, fewer crowds, and regenerative practices.",
  },
  {
    step: "03",
    title: "Travel deeper, not faster",
    description: "Arrive slowly and belong completely. Navigate hidden villages, support local artisans, and experience travel that leaves places better than you found them.",
  },
];

export function ProcessSection() {
  return (
    <Section id="process" className="bg-[#F4EFE6]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-3xl mb-16 lg:mb-20"
      >
        <motion.p variants={riseVariants} className={kicker}>
          <span className="h-px w-8 bg-[#74876B]/60" aria-hidden />
          How it works
        </motion.p>
        <motion.h2 variants={riseVariants} className={`mt-6 ${sectionTitle}`}>
          The path to <span className="italic text-[#74876B]">meaningful travel.</span>
        </motion.h2>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:gap-16"
      >
        {PROCESS_STEPS.map((item, index) => (
          <motion.div
            key={item.step}
            variants={riseVariants}
            className="group relative flex flex-col pt-8"
          >
            {/* Step Number Line */}
            <div className="absolute top-0 left-0 h-px w-full bg-[#D8D2C8] overflow-hidden">
              <motion.div
                initial={{ x: "-100%" }}
                whileInView={{ x: "0%" }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + index * 0.2, ease: EASE_EXPO }}
                className="h-full w-full bg-[#74876B]"
              />
            </div>

            <span className="mb-6 mt-4 font-display text-4xl text-[#D8D2C8] transition-colors duration-500 group-hover:text-[#74876B]">
              {item.step}
            </span>
            <h3 className="font-display text-xl text-[#33332F] sm:text-2xl mb-4">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-[#504F4A]">
              {item.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
