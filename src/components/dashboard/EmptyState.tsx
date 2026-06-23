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
    <div className="flex flex-col items-center justify-center rounded-3xl border border-mist-50/10 bg-forest-900/30 px-6 py-16 text-center sm:px-10 sm:py-20">
      {/* Icon circle */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-sun-400/20 bg-sun-400/[0.06] text-sun-400/70">
        {icon}
      </div>

      <h2 className="font-display text-xl font-light tracking-tight text-mist-50 sm:text-2xl">
        {title}
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist-200/60">
        {description}
      </p>

      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
