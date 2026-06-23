"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { optionCard } from "@/lib/design";
import type { Option } from "./onboarding.config";

/** Step heading block (eyebrow + serif title + subtitle). */
export function StepHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-xl">
      <p className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.28em] text-brand-btn-primary">
        <span className="h-px w-7 bg-brand-btn-primary/60" aria-hidden />
        {eyebrow}
      </p>
      <h2 className="mt-4 font-display text-3xl font-light leading-tight tracking-[-0.02em] text-brand-text-primary sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-brand-text-secondary">{subtitle}</p>
    </div>
  );
}

interface OptionCardProps {
  option: Option;
  selected: boolean;
  onToggle: () => void;
  /** "radio" for single-select, "checkbox" for multi-select. */
  role: "radio" | "checkbox";
  /** Hide the description (compact chip-style for dense grids). */
  compact?: boolean;
  index?: number;
}

/** A selectable option card used across the choice steps. */
export function OptionCard({
  option,
  selected,
  onToggle,
  role,
  compact = false,
  index = 0,
}: OptionCardProps) {
  return (
    <motion.button
      type="button"
      role={role}
      aria-checked={selected}
      onClick={onToggle}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.04 }}
      className={`${optionCard(selected)} ${compact ? "items-center" : ""}`}
    >
      <span
        aria-hidden
        className={`flex shrink-0 items-center justify-center rounded-xl text-xl transition-colors ${
          compact ? "h-9 w-9" : "h-11 w-11"
        } ${selected ? "bg-brand-btn-primary/15" : "bg-brand-text-primary/5"}`}
      >
        {option.glyph}
      </span>

      <span className="flex-1">
        <span className="block text-[0.95rem] font-medium text-brand-text-primary">
          {option.label}
        </span>
        {!compact && option.description && (
          <span className="mt-1 block text-sm leading-snug text-brand-text-secondary">
            {option.description}
          </span>
        )}
      </span>

      {/* Selection indicator */}
      <span
        aria-hidden
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border transition-colors duration-300 ${
          role === "checkbox" ? "rounded-md" : "rounded-full"
        } ${
          selected
            ? "border-brand-btn-primary bg-brand-btn-primary text-brand-bg"
            : "border-brand-border"
        }`}
      >
        {selected && (
          <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden>
            <path
              d="M3.5 8.5l3 3 6-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </motion.button>
  );
}

/** Wrapper that gives each step a consistent reveal + spacing. */
export function StepBody({ children }: { children: ReactNode }) {
  return <div className="mt-8 flex flex-col gap-6">{children}</div>;
}
