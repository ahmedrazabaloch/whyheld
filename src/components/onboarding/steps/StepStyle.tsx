"use client";

import { OptionCard, StepBody, StepHeader } from "../primitives";
import { STEPS, TRAVEL_STYLES } from "../onboarding.config";
import type { UseOnboarding } from "../useOnboarding";

const meta = STEPS[1];

/** Step 2 — Travel style: single select. */
export function StepStyle({ data, update }: UseOnboarding) {
  return (
    <>
      <StepHeader eyebrow={meta.eyebrow} title={meta.title} subtitle={meta.subtitle} />
      <StepBody>
        <div
          role="radiogroup"
          aria-label="Travel style"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {TRAVEL_STYLES.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              role="radio"
              index={index}
              selected={data.style === option.id}
              onToggle={() => update("style", option.id)}
            />
          ))}
        </div>
      </StepBody>
    </>
  );
}
