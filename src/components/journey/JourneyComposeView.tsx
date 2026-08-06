"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { buttonStyles } from "@/lib/design";
import {
  buildPreparingAffirmation,
  buildPreparingSubtitle,
  resolveFeelingChips,
} from "@/lib/journey/compose-preparing";

type Props = {
  journeyId: string;
  destination: string;
  firstName: string | null;
  feelingIds: string[];
  placeTitles: string[];
  placeCategories: string[];
};

export function JourneyComposeView({
  journeyId,
  destination,
  firstName,
  feelingIds,
  placeTitles,
  placeCategories,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [activeDot, setActiveDot] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const chips = useMemo(() => resolveFeelingChips(feelingIds), [feelingIds]);
  const subtitle = useMemo(
    () => buildPreparingSubtitle(feelingIds),
    [feelingIds],
  );
  const affirmation = useMemo(
    () =>
      buildPreparingAffirmation({
        firstName,
        destination,
        feelingIds,
        placeTitles,
        placeCategories,
      }),
    [firstName, destination, feelingIds, placeTitles, placeCategories],
  );

  useEffect(() => {
    if (error) return;
    const id = window.setInterval(() => {
      setActiveDot((d) => (d + 1) % 3);
    }, 520);
    return () => window.clearInterval(id);
  }, [error, attempt]);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);

    async function compose() {
      try {
        const res = await fetch(`/api/v1/journeys/${journeyId}/compose`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        });

        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          alreadyGenerated?: boolean;
          success?: boolean;
        };

        if (!res.ok) {
          setError(data.error || "We couldn't prepare your journey.");
          return;
        }

        router.replace(`/journeys/${journeyId}`);
        router.refresh();
      } catch {
        if (controller.signal.aborted) return;
        setError("We couldn't prepare your journey. Please try again.");
      }
    }

    void compose();

    return () => controller.abort();
  }, [journeyId, router, attempt]);

  if (error) {
    return (
      <div className="relative mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
        <ComposeAtmosphere />
        <p className="relative font-display text-3xl text-brand-text-primary sm:text-4xl">
          Something paused.
        </p>
        <p className="relative mt-4 max-w-md text-sm leading-relaxed text-brand-text-secondary">
          {error}
        </p>
        <div className="relative mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            className={buttonStyles.primary}
            onClick={() => setAttempt((n) => n + 1)}
          >
            Try again
          </button>
          <Link
            href={`/journeys/${journeyId}/discover`}
            className={buttonStyles.secondary}
          >
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative -mx-4 flex min-h-[78vh] w-[calc(100%+2rem)] flex-col items-center overflow-hidden px-4 py-10 text-center sm:-mx-6 sm:w-[calc(100%+3rem)] sm:px-6 sm:py-12 lg:-mx-8 lg:w-[calc(100%+4rem)] lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <ComposeAtmosphere />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center">
        {/* Hero illustration — matches the reference composition */}
        <div className="relative mb-8 w-full max-w-2xl sm:mb-10">
          <div
            className="relative mx-auto aspect-[16/9] w-full max-w-xl sm:aspect-[2/1] sm:max-w-2xl"
            style={{
              maskImage:
                "radial-gradient(ellipse 72% 78% at 50% 42%, black 42%, transparent 78%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 72% 78% at 50% 42%, black 42%, transparent 78%)",
            }}
          >
            <Image
              src="/illustrations/sunrise.png"
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 42rem, 90vw"
              className="object-contain object-center"
            />
          </div>
        </div>

        <p className="mb-4 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-brand-text-muted sm:mb-5">
          Preparing your journey
        </p>

        <h1 className="font-display text-[clamp(1.85rem,4.5vw,2.85rem)] font-light leading-[1.15] tracking-[-0.02em] text-brand-text-primary">
          Crafting something beautiful for your{" "}
          <span className="text-brand-btn-primary">{destination}</span> escape.
        </h1>

        <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-brand-text-secondary sm:text-lg">
          {subtitle}
        </p>

        {chips.length > 0 ? (
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:mt-9">
            {chips.map((chip) => {
              const Icon = chip.Icon;
              return (
                <li key={chip.id}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-brand-border/80 bg-brand-card/75 px-3.5 py-2 text-sm text-brand-text-primary shadow-sm backdrop-blur-sm">
                    <Icon
                      className="h-3.5 w-3.5 shrink-0 text-brand-btn-primary"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    {chip.label}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="mt-10 flex min-h-[5.5rem] flex-col items-center justify-start gap-3 sm:mt-12">
          <div
            className="flex h-2.5 items-center justify-center gap-2.5"
            aria-hidden="true"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={[
                  "inline-block h-2.5 w-2.5 rounded-full transition-[transform,background-color,opacity] duration-300",
                  activeDot === i
                    ? "scale-100 bg-brand-btn-primary opacity-100"
                    : "scale-[0.6] bg-brand-text-muted/55 opacity-70",
                ].join(" ")}
              />
            ))}
          </div>
          <p className="text-sm font-medium text-brand-text-primary">
            Building your personalised journey…
          </p>
          <p className="text-xs tracking-wide text-brand-text-secondary/80">
            Estimated time: 15–30 seconds
          </p>
        </div>

        <aside
          className="mt-10 w-full max-w-xl rounded-2xl border border-brand-border/60 bg-brand-card/80 px-5 py-5 text-left shadow-sm backdrop-blur-md sm:mt-12 sm:px-6"
          aria-label="Personal note"
        >
          <div className="flex gap-3.5">
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-btn-primary/12 text-brand-btn-primary"
              aria-hidden
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-brand-text-primary">
                {affirmation.greeting}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-brand-text-secondary">
                {affirmation.body}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Soft sunrise wash behind the preparing screen. */
function ComposeAtmosphere() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-x-[-8%] top-[-6%] h-[58%] opacity-[0.42] sm:opacity-[0.5]"
        style={{
          maskImage:
            "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
        }}
      >
        <Image
          src="/illustrations/sunrise.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_18%] blur-[1px] scale-105"
        />
      </div>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in srgb, var(--color-brand-bg) 35%, transparent) 0%, var(--color-brand-bg) 62%, var(--color-brand-bg) 100%)",
        }}
      />
    </div>
  );
}
