"use client";

import { useMemo, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { formStyles } from "@/lib/design";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";

const DURATION_CHIPS = [3, 5, 7, 10, 14, 21, 30] as const;

type TimingMode = "days" | "dates";

function isPresetDuration(days: number | null): days is (typeof DURATION_CHIPS)[number] {
  return days !== null && (DURATION_CHIPS as readonly number[]).includes(days);
}

function seasonalNote(start: Date, end: Date): string {
  const mid = new Date((start.getTime() + end.getTime()) / 2);
  const month = mid.getMonth(); // 0–11

  if (month >= 2 && month <= 4) {
    return "Spring often brings softer light and quieter mornings — a gentle season for lingering.";
  }
  if (month >= 5 && month <= 7) {
    return "Summer stretches the evenings. Leave room for shade, water, and unhurried afternoons.";
  }
  if (month >= 8 && month <= 10) {
    return "Autumn settles into colour and cooler air — well suited to walks and slower days.";
  }
  return "Winter asks for warmth and shorter outdoor stretches. Plan for cosy pauses between places.";
}

/**
 * Single setup step: choose either a day count or a date range (not both).
 */
export function StepWhen({
  controller,
}: {
  controller: ReturnType<typeof useJourneyBuilder>;
}) {
  const { data, update } = controller;

  const inferredMode: TimingMode =
    data.startDate || data.endDate
      ? "dates"
      : data.durationDays
        ? "days"
        : "days";

  const [mode, setMode] = useState<TimingMode>(inferredMode);
  const [customDays, setCustomDays] = useState(
    () => data.durationDays !== null && !isPresetDuration(data.durationDays),
  );

  const rangeDays =
    data.startDate && data.endDate
      ? Math.max(1, differenceInCalendarDays(data.endDate, data.startDate) + 1)
      : null;

  const seasonTip = useMemo(() => {
    if (!data.startDate || !data.endDate) return null;
    return seasonalNote(data.startDate, data.endDate);
  }, [data.startDate, data.endDate]);

  const chooseDaysMode = () => {
    setMode("days");
    if (data.startDate !== null) update("startDate", null);
    if (data.endDate !== null) update("endDate", null);
  };

  const chooseDatesMode = () => {
    setMode("dates");
    setCustomDays(false);
    if (data.durationDays !== null) update("durationDays", null);
  };

  const selectPreset = (days: number) => {
    chooseDaysMode();
    setCustomDays(false);
    update("durationDays", days);
  };

  const selectCustom = () => {
    chooseDaysMode();
    setCustomDays(true);
    if (isPresetDuration(data.durationDays)) {
      update("durationDays", null);
    }
  };

  return (
    <section id="setup-when" className="space-y-6" aria-labelledby="setup-when-title">
      <div className="space-y-2">
        <h2
          id="setup-when-title"
          className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-[1.75rem]"
        >
          How long will you linger?
        </h2>
        <p className="text-sm leading-relaxed text-brand-text-secondary">
          Give the journey a length — or choose dates for seasonal tips.
        </p>
      </div>

      {/* Single quiet line: days · or · specific dates */}
      <div
        role="radiogroup"
        aria-label="How to set timing"
        className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm"
      >
        <button
          type="button"
          role="radio"
          aria-checked={mode === "days"}
          onClick={chooseDaysMode}
          className={[
            "font-medium underline-offset-4 transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
            mode === "days"
              ? "text-brand-text-primary underline decoration-brand-btn-primary/60"
              : "text-brand-text-secondary hover:text-brand-text-primary",
          ].join(" ")}
        >
          Number of days
        </button>
        <span className="text-brand-text-secondary/55" aria-hidden>
          or
        </span>
        <button
          type="button"
          role="radio"
          aria-checked={mode === "dates"}
          onClick={chooseDatesMode}
          className={[
            "font-medium underline-offset-4 transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
            mode === "dates"
              ? "text-brand-text-primary underline decoration-brand-btn-primary/60"
              : "text-brand-text-secondary hover:text-brand-text-primary",
          ].join(" ")}
        >
          specific dates
        </button>
      </div>

      {mode === "days" ? (
        <div className="space-y-4">
          <div
            role="radiogroup"
            aria-label="Journey length in days"
            className="flex flex-wrap gap-2.5"
          >
            {DURATION_CHIPS.map((days) => {
              const selected = !customDays && data.durationDays === days;
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
                      : "border-brand-border bg-brand-bg text-brand-text-secondary hover:border-brand-text-secondary hover:text-brand-text-primary",
                  ].join(" ")}
                >
                  {days}
                </button>
              );
            })}

            <button
              type="button"
              role="radio"
              aria-checked={customDays}
              onClick={selectCustom}
              className={[
                "min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors duration-200",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
                customDays
                  ? "border-brand-btn-primary bg-brand-btn-primary/10 text-brand-text-primary"
                  : "border-brand-border bg-brand-bg text-brand-text-secondary hover:border-brand-text-secondary hover:text-brand-text-primary",
              ].join(" ")}
            >
              Custom
            </button>
          </div>

          {customDays ? (
            <div className="max-w-[14rem] space-y-2">
              <label htmlFor="custom-duration" className={formStyles.label}>
                Days you&apos;ll give it
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
                }}
              />
              <p className={formStyles.hint}>Between 1 and 30 days.</p>
            </div>
          ) : null}

          {data.durationDays ? (
            <p className="text-sm leading-relaxed text-brand-text-secondary">
              You&apos;re giving this journey about {data.durationDays}{" "}
              {data.durationDays === 1 ? "day" : "days"} — room to settle in.
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-brand-text-secondary">
              Choose a length that feels unhurried for this place.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="max-w-sm">
            <DateRangePicker
              startDate={data.startDate}
              endDate={data.endDate}
              onUpdate={(start, end) => {
                if (start !== data.startDate) update("startDate", start);
                if (end !== data.endDate) update("endDate", end);
                if ((start || end) && data.durationDays !== null) {
                  update("durationDays", null);
                }
              }}
            />
          </div>

          {rangeDays ? (
            <p className="text-sm leading-relaxed text-brand-text-secondary">
              That&apos;s about {rangeDays}{" "}
              {rangeDays === 1 ? "day" : "days"} on the ground.
            </p>
          ) : (
            <p className="text-sm leading-relaxed text-brand-text-secondary">
              Pick a start and end — we&apos;ll add a seasonal note once both are set.
            </p>
          )}

          {seasonTip ? (
            <aside className="rounded-2xl border border-brand-btn-primary/20 bg-brand-btn-primary/[0.06] px-4 py-3.5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-brand-btn-primary">
                Seasonal tip
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-text-primary/90">
                {seasonTip}
              </p>
            </aside>
          ) : null}
        </div>
      )}
    </section>
  );
}
