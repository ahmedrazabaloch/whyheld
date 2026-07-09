"use client";

import { motion } from "motion/react";
import { OptionCard } from "@/components/onboarding/primitives";
import { buttonStyles, riseVariants } from "@/lib/design";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";

const BUDGETS = [
  { id: "MODEST", label: "Modest", description: "Simple stays, local food, mindful spending.", glyph: "🏕️" },
  { id: "COMFORTABLE", label: "Comfortable", description: "Boutique stays, nice meals, some taxis.", glyph: "🏡" },
  { id: "PREMIUM", label: "Premium", description: "Upscale hotels, fine dining, premium transport.", glyph: "✨" },
  { id: "LUXURY", label: "Luxury", description: "5-star luxury, exclusive access, private transfers.", glyph: "💎" },
] as const;

export function StepPreferences({ controller }: { controller: ReturnType<typeof useJourneyBuilder> }) {
  const { data, update, next, back } = controller;

  return (
    <div className="flex flex-col flex-1">
      <motion.div variants={riseVariants} className="flex-1">
        <h3 className="font-display text-2xl font-light text-brand-text-primary mb-6">
          What is your budget tier?
        </h3>
        
        <div role="radiogroup" aria-label="Budget tier" className="flex flex-col gap-3">
          {BUDGETS.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              role="radio"
              index={index}
              selected={data.budget === option.id}
              onToggle={() => update("budget", option.id as any)}
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
          disabled={!data.budget}
          className={buttonStyles.primary}
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
