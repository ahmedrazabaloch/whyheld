"use client";

import { motion } from "motion/react";
import { Section } from "@/components/ui";
import { containerVariants, riseVariants, EASE_EXPO, kicker, sectionTitle, leadParagraph } from "@/lib/design";

interface ContentBlockProps {
  id: string;
  kickerText?: string;
  title: React.ReactNode;
  children: React.ReactNode;
  bgWhite?: boolean;
}

export function ContentBlock({ id, kickerText, title, children, bgWhite = true }: ContentBlockProps) {
  return (
    <Section id={id} className={bgWhite ? "bg-white" : "bg-[#F4EFE6]"}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-3xl"
      >
        {kickerText && (
          <motion.p variants={riseVariants} className={kicker}>
            <span className="h-px w-8 bg-[#74876B]/60" aria-hidden />
            {kickerText}
          </motion.p>
        )}
        <motion.h2 variants={riseVariants} className={`mt-6 ${sectionTitle}`}>
          {title}
        </motion.h2>
        <motion.div variants={riseVariants} className="mt-8 space-y-6 text-[#504F4A] leading-relaxed">
          {children}
        </motion.div>
      </motion.div>
    </Section>
  );
}
