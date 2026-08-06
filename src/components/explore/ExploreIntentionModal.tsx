"use client";

import { useEffect, useState } from "react";
import { buttonStyles } from "@/lib/design";
import { EXPLORE_FILTERS, exploreFilterLabels } from "@/lib/explore/filters";

type ExploreIntentionModalProps = {
  open: boolean;
  /** Destination already chosen on the search form. */
  destination: string;
  /** Filters carried over from the previous search, so adjusting feels continuous. */
  initialFilters: string[];
  onClose: () => void;
  /** Confirmed with chips — gather places leaning toward those kinds. */
  onExplore: (filters: string[]) => void;
  /** Skipped — gather the broad set for this destination. */
  onExploreOpen: () => void;
};

/**
 * The intention step, shown after a destination is entered.
 *
 * Chips stay optional: choosing them biases the places we gather, while
 * "Continue open" gathers the broad set. Nothing here blocks a search.
 */
export function ExploreIntentionModal({
  open,
  destination,
  initialFilters,
  onClose,
  onExplore,
  onExploreOpen,
}: ExploreIntentionModalProps) {
  const [draft, setDraft] = useState<string[]>(initialFilters);

  useEffect(() => {
    if (open) setDraft(initialFilters);
  }, [open, initialFilters]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (id: string) => {
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explore-intention-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-brand-border bg-brand-card p-6 shadow-lg sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="explore-intention-title"
          className="font-display text-2xl font-light tracking-tight text-brand-text-primary"
        >
          Explore with intention
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
          What draws you to{" "}
          <span className="text-brand-text-primary">{destination}</span>? Choose
          what you&apos;re seeking, or continue open and we&apos;ll gather
          broadly.
        </p>

        <div
          role="group"
          aria-label="What you are seeking"
          className="mt-6 flex max-h-[40vh] flex-wrap gap-2 overflow-y-auto"
        >
          {EXPLORE_FILTERS.map((filter) => {
            const selected = draft.includes(filter.id);
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggle(filter.id)}
                className={[
                  "rounded-full border px-3.5 py-2 text-xs font-medium tracking-wide transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
                  selected
                    ? "border-brand-btn-primary bg-brand-btn-primary/15 text-brand-text-primary"
                    : "border-brand-border/80 bg-brand-bg/40 text-brand-text-secondary hover:border-brand-text-secondary hover:text-brand-text-primary",
                ].join(" ")}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <p className="mt-4 min-h-[1.25rem] text-xs leading-relaxed text-brand-text-secondary">
          {draft.length > 0
            ? `Looking toward ${exploreFilterLabels(draft).join(" · ")}.`
            : "Nothing chosen yet — that is a fine way to arrive."}
        </p>

        <div className="mt-6 flex flex-col gap-2 border-t border-brand-border/50 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            className={buttonStyles.secondary}
            onClick={onExploreOpen}
          >
            Continue open
          </button>
          <button
            type="button"
            className={buttonStyles.primary}
            disabled={draft.length === 0}
            onClick={() => onExplore(draft)}
          >
            {draft.length > 0
              ? `Explore with ${draft.length} ${draft.length === 1 ? "intention" : "intentions"}`
              : "Explore with intention"}
          </button>
        </div>
      </div>
    </div>
  );
}
