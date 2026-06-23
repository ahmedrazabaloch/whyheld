"use client";

import { OptionCard, StepBody, StepHeader } from "../primitives";
import { PACES, STEPS } from "../onboarding.config";
import type { UseOnboarding } from "../useOnboarding";

const meta = STEPS[3];

/** Step 4 — Travel pace: single select. */
export function StepPace({ data, update }: UseOnboarding) {
  return (
    <>
      <StepHeader eyebrow={meta.eyebrow} title={meta.title} subtitle={meta.subtitle} />
      <StepBody>
        <div
          role="radiogroup"
          aria-label="Travel pace"
          className="flex flex-col gap-3"
        >
          {PACES.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              role="radio"
              index={index}
              selected={data.pace === option.id}
              onToggle={() => update("pace", option.id)}
            />
          ))}
        </div>
      </StepBody>
    </>
  );
}
