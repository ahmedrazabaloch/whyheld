"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
      <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-3xl text-brand-text-primary sm:text-4xl">
          Something paused.
        </p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-brand-text-secondary">
          {error}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
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
      className="relative mx-auto flex min-h-[78vh] w-full max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 28%, color-mix(in srgb, var(--color-brand-btn-primary) 8%, transparent), transparent 70%), radial-gradient(ellipse 60% 40% at 50% 80%, color-mix(in srgb, var(--color-brand-border) 55%, transparent), transparent 75%)",
        }}
      />

      <p className="mb-5 text-[0.68rem] font-medium uppercase tracking-[0.28em] text-brand-text-muted">
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
        <div className="mt-10 w-full border-t border-brand-border/50 pt-8">
          <ul className="flex flex-wrap items-center justify-center gap-2.5">
            {chips.map((chip) => {
              const Icon = chip.Icon;
              return (
                <li key={chip.id}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-card/70 px-3.5 py-2 text-sm text-brand-text-primary shadow-sm backdrop-blur-sm">
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
        </div>
      ) : null}

      <div className="mt-12 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={[
                "rounded-full transition-all duration-300",
                activeDot === i
                  ? "h-2.5 w-2.5 bg-brand-btn-primary"
                  : "h-1.5 w-1.5 bg-brand-text-muted/55",
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
        className="mt-12 w-full max-w-xl rounded-2xl border border-brand-border/70 bg-brand-bg/80 px-5 py-5 text-left shadow-sm backdrop-blur-sm sm:px-6"
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
  );
}
