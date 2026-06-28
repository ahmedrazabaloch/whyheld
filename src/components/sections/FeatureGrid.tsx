"use client";

import { motion } from "motion/react";
import { ResilientImage } from "@/components/hero/ResilientImage";
import { Section } from "@/components/ui";
import { containerVariants, riseVariants, EASE_EXPO } from "@/lib/design";

interface Feature {
  title: string;
  description: string;
  image: string;
  alt: string;
  reverse?: boolean;
}

interface FeatureGridProps {
  id: string;
  features: Feature[];
  bgWhite?: boolean;
}

export function FeatureGrid({ id, features, bgWhite = false }: FeatureGridProps) {
  return (
    <Section id={id} className={bgWhite ? "bg-white" : "bg-[#F4EFE6]"}>
      <div className="flex flex-col gap-24 lg:gap-32">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className={`grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 ${
              feature.reverse ? "" : ""
            }`}
          >
            <motion.div
              variants={riseVariants}
              className={`relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(51,51,47,0.1)] ${
                feature.reverse ? "lg:order-2" : "lg:order-1"
              }`}
            >
              <ResilientImage
                src={feature.image}
                alt={feature.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
            
            <motion.div
              variants={riseVariants}
              className={`flex flex-col ${feature.reverse ? "lg:order-1 lg:pr-12" : "lg:order-2 lg:pl-12"}`}
            >
              <h3 className="font-display text-3xl text-[#33332F] sm:text-4xl">
                {feature.title}
              </h3>
              <p className="mt-6 text-base leading-relaxed text-[#504F4A] sm:text-lg">
                {feature.description}
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
