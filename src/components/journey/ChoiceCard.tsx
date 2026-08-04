"use client";

import type { LucideIcon } from "lucide-react";

interface ChoiceCardProps {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  Icon: LucideIcon;
  /** Multi-select (feelings) vs single-select (pace/budget). */
  multi?: boolean;
}

/** Profile-style selection card for journey setup choices. */
export function ChoiceCard({
  label,
  description,
  selected,
  onSelect,
  Icon,
  multi = false,
}: ChoiceCardProps) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      className={[
        "flex cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
        selected
          ? "border-brand-btn-primary bg-brand-btn-primary/10 ring-1 ring-brand-btn-primary"
          : "border-brand-border bg-brand-bg/60 hover:border-brand-text-secondary/50 hover:bg-brand-text-primary/[0.03]",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <span
          className={[
            "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
            selected
              ? "bg-brand-btn-primary/15 text-brand-btn-primary"
              : "bg-brand-text-primary/5 text-brand-text-secondary",
          ].join(" ")}
          aria-hidden
        >
          <Icon className="h-5 w-5" strokeWidth={1.6} />
        </span>
        {selected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-btn-primary text-brand-bg">
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden>
              <path
                d="M3.5 8.5l3 3 6-7"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm font-semibold text-brand-text-primary">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-brand-text-secondary">
          {description}
        </p>
      </div>
    </button>
  );
}
