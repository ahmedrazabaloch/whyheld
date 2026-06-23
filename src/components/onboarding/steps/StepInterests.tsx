"use client";

import { OptionCard, StepBody, StepHeader } from "../primitives";
import { INTERESTS, STEPS } from "../onboarding.config";
import type { UseOnboarding } from "../useOnboarding";

const meta = STEPS[2];

/** Step 3 — Interests: multi select (compact). */
export function StepInterests({ data, toggleInArray }: UseOnboarding) {
  return (
    <>
      <StepHeader eyebrow={meta.eyebrow} title={meta.title} subtitle={meta.subtitle} />
      <StepBody>
        <div
          role="group"
          aria-label="Interests"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          {INTERESTS.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              role="checkbox"
              compact
              index={index}
              selected={data.interests.includes(option.id)}
              onToggle={() => toggleInArray("interests", option.id)}
            />
          ))}
        </div>
        <p className="text-xs text-mist-200/50">
          {data.interests.length} selected · choose as many as you like
        </p>
      </StepBody>
    </>
  );
}
