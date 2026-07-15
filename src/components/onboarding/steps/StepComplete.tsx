"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { buttonStyles, EASE_EXPO } from "@/lib/design";
import {
  INTERESTS,
  PACES,
  PREFERENCES,
  STEPS,
  TRAVEL_STYLES,
} from "../onboarding.config";
import type { UseOnboarding } from "../useOnboarding";

const meta = STEPS[STEPS.length - 1];

function labelFor(list: { id: string; label: string }[], id: string | null) {
  return list.find((o) => o.id === id)?.label;
}

function labelsFor(list: { id: string; label: string }[], ids: string[]) {
  return ids
    .map((id) => list.find((o) => o.id === id)?.label)
    .filter(Boolean) as string[];
}

/** Step 6 — Profile complete: a calm summary + entry to the product. */
export function StepComplete({ data, complete, saving, saveError }: UseOnboarding) {
  const router = useRouter();
  const style = labelFor(TRAVEL_STYLES, data.style);
  const pace = labelFor(PACES, data.pace);
  const interests = labelsFor(INTERESTS, data.interests);
  const preferences = labelsFor(PREFERENCES, data.preferences);

  const summary: { label: string; values: string[] }[] = [
    { label: "Travel style", values: style ? [style] : [] },
    { label: "Pace", values: pace ? [pace] : [] },
    { label: "Interests", values: interests },
    { label: "Preferences", values: preferences },
  ];

  async function handleEnter() {
    const saved = await complete();
    if (!saved) return;
    router.push("/journeys/new");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center text-center">
      {/* Success seal */}
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE_EXPO }}
        className="flex h-16 w-16 items-center justify-center rounded-full border border-brand-btn-primary/40 bg-brand-btn-primary/10 text-brand-btn-primary"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
          <path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.span>

      <p className="mt-6 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.28em] text-brand-btn-primary">
        {meta.eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-light leading-tight tracking-[-0.02em] text-brand-text-primary sm:text-4xl">
        {meta.title}
      </h2>
      <p className="mt-3 max-w-md text-base leading-relaxed text-brand-text-secondary">
        {meta.subtitle}
      </p>

      {/* Summary */}
      <dl className="mt-9 grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2">
        {summary.map((row) => (
          <div
            key={row.label}
            className="rounded-2xl border border-brand-card-border bg-brand-card p-4 shadow-card"
          >
            <dt className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-brand-text-secondary">
              {row.label}
            </dt>
            <dd className="mt-2 flex flex-wrap gap-1.5">
              {row.values.length > 0 ? (
                row.values.map((value) => (
                  <span
                    key={value}
                    className="rounded-full border border-brand-border bg-brand-text-primary/5 px-2.5 py-1 text-[0.72rem] text-brand-text-primary"
                  >
                    {value}
                  </span>
                ))
              ) : (
                <span className="text-sm text-brand-text-secondary/60">—</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-9 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={handleEnter}
          disabled={saving}
          className={`${buttonStyles.primary} h-12 px-7 text-sm sm:flex-1`}
        >
          {saving ? "Entering Wayheld…" : "Enter Wayheld"}
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
          >
            <path
              d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {saveError && (
        <p className="mt-4 text-sm text-brand-btn-primary" role="alert">
          {saveError}
        </p>
      )}
    </div>
  );
}
