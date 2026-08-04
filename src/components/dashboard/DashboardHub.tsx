"use client";

import Link from "next/link";

type HubJourney = {
  id: string;
  title: string;
} | null;

type Props = {
  draft: HubJourney;
  ready: HubJourney;
};

export function DashboardHub({ draft, ready }: Props) {
  const continueHref = draft
    ? `/journeys/${draft.id}/build`
    : ready
      ? `/journeys/${ready.id}`
      : null;

  const continueLabel = draft
    ? draft.title !== "Untitled Journey"
      ? `Continue ${draft.title}`
      : "Continue your draft"
    : ready
      ? ready.title !== "Untitled Journey"
        ? `Continue ${ready.title}`
        : "Continue your journey"
      : "No journey in progress";

  const continueHelper = draft
    ? "Pick up where you left the builder."
    : ready
      ? "Return to a journey that is ready to read."
      : "Begin a journey or explore a place first — then it will wait for you here.";

  return (
    <section aria-labelledby="dashboard-hub-title" className="mb-8">
      <h2
        id="dashboard-hub-title"
        className="mb-2 font-display text-xl text-brand-text-primary sm:text-2xl"
      >
        What would you like to do?
      </h2>
      <p className="mb-6 max-w-xl text-sm leading-relaxed text-brand-text-secondary">
        Begin a journey, or continue something already underway. Explore lives
        in the sidebar when you want to wander without a plan.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <HubCard
          title="Begin a New Journey"
          body="Choose a destination and shape the pace, length, and comfort of the path ahead."
          href="/journeys/new"
          cta="Begin"
        />
        <HubCard
          title="Continue Journey"
          body={continueHelper}
          href={continueHref}
          cta={continueHref ? "Continue" : continueLabel}
          disabled={!continueHref}
          detail={continueHref ? continueLabel : undefined}
        />
      </div>
    </section>
  );
}

function HubCard({
  title,
  body,
  href,
  cta,
  disabled,
  detail,
}: {
  title: string;
  body: string;
  href: string | null;
  cta: string;
  disabled?: boolean;
  detail?: string;
}) {
  const className =
    "flex h-full flex-col rounded-2xl border border-brand-border/60 bg-brand-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-7";

  const content = (
    <>
      <h3 className="font-display text-lg text-brand-text-primary sm:text-xl">
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-text-secondary">
        {body}
      </p>
      {detail ? (
        <p className="mt-3 truncate text-xs font-medium text-brand-text-primary/80">
          {detail}
        </p>
      ) : null}
      <span
        className={[
          "mt-5 inline-flex min-h-[44px] w-fit items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors",
          disabled
            ? "cursor-not-allowed border border-brand-border/60 bg-brand-bg/60 text-brand-text-secondary/60"
            : "bg-brand-btn-primary text-brand-bg hover:bg-brand-btn-primary-hover",
        ].join(" ")}
      >
        {cta}
        {!disabled ? (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M1 7h12M8 2l5 5-5 5" />
          </svg>
        ) : null}
      </span>
    </>
  );

  if (disabled || !href) {
    return (
      <div className={`${className} opacity-80`} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <Link href={href} prefetch={false} className={className}>
      {content}
    </Link>
  );
}
