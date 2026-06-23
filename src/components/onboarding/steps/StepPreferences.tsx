"use client";

import { OptionCard, StepBody, StepHeader } from "../primitives";
import { PREFERENCES, STEPS } from "../onboarding.config";
import type { UseOnboarding } from "../useOnboarding";

const meta = STEPS[4];

/** Step 5 — Travel preferences: multi select. */
export function StepPreferences({ data, toggleInArray }: UseOnboarding) {
  return (
    <>
      <StepHeader eyebrow={meta.eyebrow} title={meta.title} subtitle={meta.subtitle} />
      <StepBody>
        <div
          role="group"
          aria-label="Travel preferences"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {PREFERENCES.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              role="checkbox"
              index={index}
              selected={data.preferences.includes(option.id)}
              onToggle={() => toggleInArray("preferences", option.id)}
            />
          ))}
        </div>
      </StepBody>
    </>
  );
}
