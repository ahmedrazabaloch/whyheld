"use client";

import { TextField } from "@/components/auth";
import { StepBody, StepHeader } from "../primitives";
import { STEPS } from "../onboarding.config";
import type { UseOnboarding } from "../useOnboarding";

const meta = STEPS[0];

/** Step 1 — Account creation: confirm name + email. */
export function StepAccount({ data, update }: UseOnboarding) {
  return (
    <>
      <StepHeader eyebrow={meta.eyebrow} title={meta.title} subtitle={meta.subtitle} />
      <StepBody>
        <div className="flex flex-col gap-5">
          <TextField
            label="Full name"
            autoComplete="name"
            placeholder="Your name"
            value={data.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
            hint="We'll only use this for your account and journey updates."
          />
        </div>
      </StepBody>
    </>
  );
}
