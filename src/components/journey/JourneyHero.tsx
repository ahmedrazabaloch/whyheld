export interface JourneyHeroProps {
  title: string;
  duration: string;
  status: string;
  createdDate: string;
  /** Country shown above the journey title when available. */
  country?: string | null;
  /** Short country note under the title. */
  countryBlurb?: string | null;
}

export function JourneyHero({
  title,
  duration,
  status,
  createdDate,
  country,
  countryBlurb,
}: JourneyHeroProps) {
  const eyebrow = `${status} • ${duration}`;
  const countryLabel = country?.trim() || null;
  const blurb = countryBlurb?.trim() || null;

  return (
    <div className="mb-8 flex flex-col gap-4 sm:mb-10">
      <div>
        <p className="mb-2 inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-brand-btn-primary">
          <span className="h-px w-5 bg-brand-btn-primary/60" aria-hidden />
          {eyebrow}
        </p>

        {countryLabel ? (
          <p className="mb-2 font-display text-sm font-medium uppercase tracking-[0.28em] text-brand-btn-primary">
            {countryLabel}
          </p>
        ) : null}

        <h1 className="font-display text-2xl font-light tracking-tight text-brand-text-primary sm:text-3xl">
          {title}
        </h1>

        {blurb ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-text-secondary">
            {blurb}
          </p>
        ) : null}

        <p className="mt-2 text-xs tracking-wide text-brand-text-secondary/80">
          Created on {createdDate}
        </p>
      </div>
    </div>
  );
}
