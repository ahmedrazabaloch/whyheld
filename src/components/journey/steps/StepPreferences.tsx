"use client";

import { OptionCard } from "@/components/onboarding/primitives";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";

const BUDGETS = [
  {
    id: "MODEST",
    label: "Modest",
    description: "Thoughtful stays, local tables and simple comforts.",
    glyph: "🏕️",
  },
  {
    id: "COMFORTABLE",
    label: "Comfortable",
    description: "Comfortable places to stay, good food and time well spent.",
    glyph: "🏡",
  },
  {
    id: "PREMIUM",
    label: "Premium",
    description: "A little more comfort, with room for memorable experiences.",
    glyph: "✨",
  },
  {
    id: "LUXURY",
    label: "Luxury",
    description: "Exceptional comfort, privacy and carefully chosen experiences.",
    glyph: "💎",
  },
] as const;

export function StepPreferences({ controller }: { controller: ReturnType<typeof useJourneyBuilder> }) {
  const { data, update } = controller;

  return (
    <section
      id="setup-travel-style"
      className="scroll-mt-[var(--setup-scroll-margin,7.5rem)] space-y-5"
    >
      <h2 className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-[1.75rem]">
        How would you like to travel?
      </h2>

      <div
        role="radiogroup"
        aria-label="Travel style"
        className="flex flex-col gap-3"
      >
        {BUDGETS.map((option, index) => (
          <OptionCard
            key={option.id}
            option={option}
            role="radio"
            index={index}
            selected={data.budget === option.id}
            onToggle={() => update("budget", option.id)}
          />
        ))}
      </div>
    </section>
  );
}
