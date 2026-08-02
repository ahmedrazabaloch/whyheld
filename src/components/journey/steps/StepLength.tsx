"use client";

import { useEffect, useState } from "react";
import { formStyles } from "@/lib/design";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";

const DURATION_CHIPS = [3, 5, 7, 10, 14, 21, 30] as const;

function isPresetDuration(days: number | null): days is (typeof DURATION_CHIPS)[number] {
  return days !== null && (DURATION_CHIPS as readonly number[]).includes(days);
}

export function StepLength({ controller }: { controller: ReturnType<typeof useJourneyBuilder> }) {
  const { data, update } = controller;

  const [customMode, setCustomMode] = useState(
    () => data.durationDays !== null && !isPresetDuration(data.durationDays),
  );

  // Exit custom mode when a preset duration is restored, or when duration
  // is cleared by the date picker (mutual exclusivity).
  useEffect(() => {
    if (isPresetDuration(data.durationDays)) {
      setCustomMode(false);
    } else if (data.durationDays === null && (data.startDate || data.endDate)) {
      setCustomMode(false);
    }
  }, [data.durationDays, data.startDate, data.endDate]);

  const selectPreset = (days: number) => {
    setCustomMode(false);
    update("durationDays", days);
    // Mutual exclusivity: clear specific dates when duration is chosen
    if (data.startDate !== null) update("startDate", null);
    if (data.endDate !== null) update("endDate", null);
  };

  const selectCustom = () => {
    setCustomMode(true);
    if (isPresetDuration(data.durationDays)) {
      update("durationDays", null);
    }
  };

  return (
    <section
      id="setup-journey-length"
      className="scroll-mt-[var(--setup-scroll-margin,7.5rem)] space-y-5"
    >
      <h2 className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-[1.75rem]">
        How much time would you like to give this journey?
      </h2>

      <div
        role="radiogroup"
        aria-label="Journey length in days"
        className="flex flex-wrap gap-2.5"
      >
        {DURATION_CHIPS.map((days) => {
          const selected = !customMode && data.durationDays === days;
          return (
            <button
              key={days}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => selectPreset(days)}
              className={[
                "min-h-[44px] min-w-[48px] rounded-full border px-4 text-sm font-medium transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
                selected
                  ? "border-brand-btn-primary bg-brand-btn-primary/10 text-brand-text-primary"
                  : "border-brand-border bg-brand-card text-brand-text-secondary hover:border-brand-text-secondary hover:text-brand-text-primary",
              ].join(" ")}
            >
              {days}
            </button>
          );
        })}

        <button
          type="button"
          role="radio"
          aria-checked={customMode}
          onClick={selectCustom}
          className={[
            "min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors duration-200",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
            customMode
              ? "border-brand-btn-primary bg-brand-btn-primary/10 text-brand-text-primary"
              : "border-brand-border bg-brand-card text-brand-text-secondary hover:border-brand-text-secondary hover:text-brand-text-primary",
          ].join(" ")}
        >
          Custom
        </button>
      </div>

      {customMode && (
        <div className="max-w-[12rem] space-y-2">
          <label htmlFor="custom-duration" className={formStyles.label}>
            Days
          </label>
          <input
            id="custom-duration"
            type="number"
            min={1}
            max={30}
            className={formStyles.input}
            placeholder="e.g. 9"
            value={data.durationDays ?? ""}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              update("durationDays", val > 0 ? val : null);
              if (val > 0) {
                if (data.startDate !== null) update("startDate", null);
                if (data.endDate !== null) update("endDate", null);
              }
            }}
          />
          <p className={formStyles.hint}>Between 1 and 30 days.</p>
        </div>
      )}
    </section>
  );
}
