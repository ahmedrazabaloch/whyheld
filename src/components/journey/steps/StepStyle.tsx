"use client";

import { motion } from "motion/react";
import { OptionCard } from "@/components/onboarding/primitives";
import { PACES } from "@/components/onboarding/onboarding.config";
import { buttonStyles, riseVariants } from "@/lib/design";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";

// Map onboarding UI IDs to Prisma enums
const PACE_MAP: Record<string, "ONE_PLACE_DEEPLY" | "SLOW_UNHURRIED" | "GENTLY_BALANCED"> = {
  "very-slow": "ONE_PLACE_DEEPLY",
  "slow": "SLOW_UNHURRIED",
  "balanced": "GENTLY_BALANCED",
};

const REVERSE_PACE_MAP = {
  ONE_PLACE_DEEPLY: "very-slow",
  SLOW_UNHURRIED: "slow",
  GENTLY_BALANCED: "balanced",
};

export function StepStyle({ controller }: { controller: ReturnType<typeof useJourneyBuilder> }) {
  const { data, update, next, back } = controller;

  const currentUiPace = data.pace ? REVERSE_PACE_MAP[data.pace] : null;

  return (
    <div className="flex flex-col flex-1">
      <motion.div variants={riseVariants} className="flex-1">
        <h3 className="font-display text-2xl font-light text-brand-text-primary mb-6">
          What is your preferred pace?
        </h3>
        
        <div role="radiogroup" aria-label="Travel pace" className="flex flex-col gap-3">
          {PACES.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              role="radio"
              index={index}
              selected={currentUiPace === option.id}
              onToggle={() => update("pace", PACE_MAP[option.id])}
            />
          ))}
        </div>
      </motion.div>

      <motion.div variants={riseVariants} className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={back}
          className={buttonStyles.ghost}
        >
          Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!data.pace}
          className={buttonStyles.primary}
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
