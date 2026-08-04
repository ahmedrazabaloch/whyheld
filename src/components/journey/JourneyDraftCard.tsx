import Link from "next/link";
import { surfaces } from "@/lib/design";

export interface JourneyDraftCardProps {
  id: string;
  title: string;
  updatedDate: string;
}

export function JourneyDraftCard({
  id,
  title,
  updatedDate,
}: JourneyDraftCardProps) {
  return (
    <article
      className={`${surfaces.card} relative overflow-hidden p-5 transition-shadow duration-200 hover:shadow-md sm:p-6`}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-brand-btn-primary/70" aria-hidden />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <span className={`${surfaces.chip} mb-3 inline-flex`}>Draft</span>
          <h3
            className="font-display text-xl tracking-tight text-brand-text-primary sm:text-2xl"
            title={title}
          >
            {title}
          </h3>
          <p className="mt-2 text-sm text-brand-text-secondary">
            Last edited on {updatedDate}
          </p>
        </div>

        <Link
          href={`/journeys/${id}/build`}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-full bg-brand-btn-primary px-5 text-sm font-medium text-brand-bg shadow-sm transition-colors hover:bg-brand-btn-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
        >
          Continue journey
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
