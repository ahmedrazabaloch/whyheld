import type { Variants } from "motion/react";

/**
 * Shared design tokens for composition in TS/JSX.
 *
 * These mirror the values documented in DESIGN_SYSTEM.md. Components should
 * import from here rather than re-declaring class strings, easing tuples, or
 * Motion variants. See globals.css for the CSS-level tokens (colors, shadows,
 * section spacing utilities).
 */

/** House easing curve — matches CSS `--ease-out-expo`. */
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/** Default in-view trigger for scroll reveals. */
export const VIEWPORT_ONCE = { once: true, amount: 0.4 } as const;

/* -------------------------------------------------------------------------- */
/* Motion variants                                                            */
/* -------------------------------------------------------------------------- */

/** Stagger parent for grouped reveals. */
export const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

/** The standard reveal: fade + rise + de-blur. */
export const riseVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: EASE_EXPO },
  },
};

/** Convenience props for a simple fade-up that triggers in view. */
export const fadeUpInView = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: VIEWPORT_ONCE,
  transition: { duration: 0.85, ease: EASE_EXPO },
} as const;

/* -------------------------------------------------------------------------- */
/* Class recipes                                                              */
/* -------------------------------------------------------------------------- */

/** Eyebrow / kicker label above section headlines. */
export const kicker =
  "inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.28em] text-brand-btn-primary";

/** Section H2 headline (pair with `font-display`). */
export const sectionTitle =
  "font-display text-balance text-section-title font-light leading-[1.02] tracking-[-0.02em] text-brand-text-primary";

/** Lead paragraph beneath a section headline. */
export const leadParagraph =
  "text-base leading-relaxed text-brand-text-secondary sm:text-lg";

/** Outer <section> chrome shared by every landing section. */
export const sectionShell =
  "relative isolate w-full overflow-hidden bg-brand-bg section-y";

/** Inner content container. */
export const sectionContainer = "mx-auto w-full max-w-7xl container-x";

/** Card / surface recipes. */
export const surfaces = {
  card: "rounded-3xl border border-brand-card-border bg-brand-card shadow-card",
  panel:
    "rounded-3xl border border-brand-card-border bg-brand-card/55 backdrop-blur-xl shadow-panel",
  stage:
    "rounded-4xl border border-brand-card-border bg-brand-card shadow-stage",
  chip: "rounded-full border border-brand-border bg-brand-text-primary/5 px-2.5 py-1 text-[0.68rem] font-medium tracking-wide text-brand-text-secondary",
} as const;

/** Button recipes (shared focus ring + transitions baked in). */
export const buttonStyles = {
  primary:
    "group inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-btn-primary px-6 font-medium text-brand-bg shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-brand-btn-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-brand-btn-primary disabled:hover:-translate-y-0",
  secondary:
    "group inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-border px-6 font-medium text-brand-text-primary shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:border-brand-text-secondary hover:bg-brand-text-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:-translate-y-0",
  ghost:
    "group inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 px-4 font-medium text-brand-text-primary transition-colors duration-200 hover:text-brand-btn-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
} as const;

/** Form recipes (see DESIGN_SYSTEM.md §11). */
export const formStyles = {
  /** Overline-style field label. */
  label:
    "text-[0.7rem] font-medium uppercase tracking-[0.2em] text-brand-text-secondary",
  /** Text input / textarea base. */
  input:
    "w-full rounded-2xl border border-brand-border bg-brand-card px-4 py-3 text-brand-text-primary placeholder:text-brand-text-secondary/50 transition-colors duration-300 hover:border-brand-text-secondary focus:border-brand-btn-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
  /** Inline error / hint text. */
  error: "text-xs text-brand-btn-primary",
  hint: "text-xs text-brand-text-secondary",
} as const;

/**
 * Selectable option card for pickable lists. Pass `selected` to toggle the
 * active styling.
 */
export function optionCard(selected: boolean): string {
  return [
    "group relative flex w-full cursor-pointer items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary sm:p-5",
    selected
      ? "border-brand-btn-primary bg-brand-btn-primary/10 shadow-[0_20px_60px_-40px_rgba(116,135,107,0.3)]"
      : "border-brand-border bg-brand-card hover:border-brand-text-secondary hover:bg-brand-bg/40",
  ].join(" ");
}
