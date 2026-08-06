"use client";

import Image from "next/image";
import Link from "next/link";
import { destinationDisplayName } from "@/components/discovery/discovery-data";

type HubJourney = {
  id: string;
  title: string;
  originQuery: string | null;
  primaryCountry: string | null;
  region: string | null;
} | null;

type Props = {
  /** Most recently updated incomplete (DRAFT) journey, if any. */
  draft: HubJourney;
};

function resolveDestination(journey: NonNullable<HubJourney>): string | null {
  if (journey.originQuery?.trim()) {
    return destinationDisplayName(journey.originQuery);
  }
  return journey.region?.trim() || journey.primaryCountry?.trim() || null;
}

/**
 * Continue is enabled only when an incomplete draft exists. If several drafts
 * are open, the page passes the most recently updated one so Continue resumes
 * that journey; otherwise the CTA is disabled.
 */
export function DashboardHub({ draft }: Props) {
  const continueHref = draft ? `/journeys/${draft.id}/build` : null;
  const destination = draft ? resolveDestination(draft) : null;

  const continueLabel = draft
    ? destination
      ? `Continue Journey to ${destination}`
      : "Continue your draft"
    : "No journey in progress";

  const continueHelper = draft
    ? "Pick up where you left the builder."
    : "Begin a journey first — then it will wait for you here.";

  return (
    <section aria-labelledby="dashboard-hub-title" className="mb-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <HubCard
          title="Begin a New Journey"
          body="Choose a destination and shape the pace, length, and comfort of the path ahead."
          href="/journeys/new"
          cta="Begin"
          illustrationSrc="/illustrations/journey-path.png"
        />
        <HubCard
          title="Continue Journey"
          body={continueHelper}
          href={continueHref}
          cta={continueHref ? "Continue" : continueLabel}
          disabled={!continueHref}
          detail={continueHref ? continueLabel : undefined}
          illustrationSrc="/illustrations/cityscape.png"
          illustrationContainerClassName="pointer-events-none absolute -bottom-3 right-0 top-0 hidden w-[50%] md:block"
          illustrationImageClassName="object-cover object-[28%_bottom]"
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
  illustrationSrc,
  illustrationContainerClassName,
  illustrationImageClassName,
}: {
  title: string;
  body: string;
  href: string | null;
  cta: string;
  disabled?: boolean;
  detail?: string;
  illustrationSrc: string;
  illustrationContainerClassName?: string;
  illustrationImageClassName?: string;
}) {
  const className =
    "relative flex h-full overflow-hidden rounded-2xl border border-brand-border/60 bg-brand-card p-6 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-7";

  const content = (
    <>
      <div className="relative z-10 flex w-full max-w-none flex-col md:max-w-[58%]">
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
      </div>

      <div
        className={
          illustrationContainerClassName ??
          "pointer-events-none absolute -bottom-3 -right-4 top-0 hidden w-[50%] md:block"
        }
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 18%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 18%)",
        }}
        aria-hidden
      >
        <Image
          src={illustrationSrc}
          alt=""
          fill
          className={
            illustrationImageClassName ?? "object-cover object-right-bottom"
          }
          sizes="(min-width: 768px) 280px, 0px"
        />
      </div>
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
