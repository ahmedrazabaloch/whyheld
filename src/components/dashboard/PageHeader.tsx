import type { ReactNode } from "react";

/**
 * Page-header block shared by all app pages inside the dashboard layout.
 * Renders a consistent eyebrow + title + optional description above each
 * page's content, keeping visual rhythm across routes.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.28em] text-sun-300">
            <span className="h-px w-5 bg-sun-400/60" aria-hidden />
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-light tracking-tight text-mist-50 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-mist-200/60">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
}
