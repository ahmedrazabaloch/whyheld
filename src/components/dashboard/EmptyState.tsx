import type { ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Empty-state block used across all placeholder pages                 */
/* ------------------------------------------------------------------ */

interface EmptyStateProps {
  /** Decorative icon rendered in a muted glow circle. */
  icon: ReactNode;
  /** Primary heading. */
  title: string;
  /** Supporting description. */
  description: string;
  /** Optional CTA or slot below the description. */
  action?: ReactNode;
}

/**
 * Shared empty-state card. On-system: forest surface, sun accent icon
 * ring, mist text hierarchy. Used wherever a feature section has no data
 * yet — journeys list, saved places, billing, etc.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-brand-border/60 bg-brand-card/30 px-6 py-16 text-center sm:px-10 sm:py-20 shadow-sm">
      {/* Icon circle */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-brand-btn-primary/20 bg-brand-btn-primary/10 text-brand-btn-primary">
        {icon}
      </div>

      <h2 className="font-display text-2xl font-light tracking-tight text-brand-text-primary">
        {title}
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-brand-text-secondary">
        {description}
      </p>

      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
