"use client";

import { OptionCard } from "@/components/onboarding/primitives";
import { PACES } from "@/components/onboarding/onboarding.config";
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
  const { data, update } = controller;

  const currentUiPace = data.pace ? REVERSE_PACE_MAP[data.pace] : null;

  return (
    <section
      id="setup-journey-feel"
      className="scroll-mt-[var(--setup-scroll-margin,7.5rem)] space-y-5"
    >
      <h2 className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-[1.75rem]">
        How would you like this journey to feel?
      </h2>

      <div
        role="radiogroup"
        aria-label="Journey feel"
        className="grid gap-3 sm:grid-cols-1"
      >
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
    </section>
  );
}
