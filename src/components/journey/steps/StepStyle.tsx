"use client";

import { ChoiceCard } from "@/components/journey/ChoiceCard";
import {
  JOURNEY_FEELINGS,
  MAX_JOURNEY_FEELINGS,
  paceFromFeelings,
} from "@/lib/journey/feelings";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";

/**
 * Journey Feel — client App Overview list only, ChoiceCard styling.
 * Pace is derived from rhythm chips for AI (not a separate setup step).
 */
export function StepStyle({
  controller,
}: {
  controller: ReturnType<typeof useJourneyBuilder>;
}) {
  const { data, update } = controller;
  const selectedFeelings = data.feelings ?? [];

  const toggleFeeling = (id: string) => {
    const next = selectedFeelings.includes(id)
      ? selectedFeelings.filter((f) => f !== id)
      : selectedFeelings.length >= MAX_JOURNEY_FEELINGS
        ? selectedFeelings
        : [...selectedFeelings, id];
    update("feelings", next);
    update("pace", paceFromFeelings(next));
  };

  return (
    <section
      id="setup-journey-feel"
      className="space-y-5"
      aria-labelledby="setup-feel-title"
    >
      <div>
        <h2
          id="setup-feel-title"
          className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-[1.75rem]"
        >
          How would you like this journey to feel?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
          Choose up to {MAX_JOURNEY_FEELINGS}. This shapes how Discovery finds
          places worth lingering with.
        </p>
      </div>

      <div
        role="group"
        aria-label="Journey feelings"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {JOURNEY_FEELINGS.map((feeling) => (
          <ChoiceCard
            key={feeling.id}
            multi
            label={feeling.label}
            description={feeling.description}
            Icon={feeling.Icon}
            selected={selectedFeelings.includes(feeling.id)}
            onSelect={() => toggleFeeling(feeling.id)}
          />
        ))}
      </div>
    </section>
  );
}
