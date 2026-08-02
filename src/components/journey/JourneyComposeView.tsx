"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buttonStyles } from "@/lib/design";

const MESSAGES = [
  "Preparing your journey...",
  "We're arranging your days carefully.",
  "Finding the best rhythm.",
  "Choosing meaningful transitions.",
];

type Props = {
  journeyId: string;
};

export function JourneyComposeView({ journeyId }: Props) {
  const router = useRouter();
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (error) return;
    const id = window.setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [error, attempt]);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setMessageIndex(0);

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
          <Link href={`/journeys/${journeyId}/discover`} className={buttonStyles.secondary}>
            Back to Discovery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto flex min-h-[75vh] w-full max-w-2xl flex-col items-center justify-center px-4 text-center"
      aria-busy="true"
      aria-live="polite"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 40%, color-mix(in srgb, var(--color-brand-border) 45%, transparent), transparent 70%)",
        }}
      />

      <p className="mb-6 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-brand-text-secondary/80">
        Journey Generation
      </p>

      <h1 className="font-display text-3xl leading-snug text-brand-text-primary transition-opacity duration-500 sm:text-4xl">
        {MESSAGES[messageIndex]}
      </h1>

      <p className="mt-6 max-w-md text-sm leading-relaxed text-brand-text-secondary">
        Your selected places are being shaped into quiet days — morning, afternoon,
        and evening — with room to breathe.
      </p>

      <div className="mt-12 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-text-secondary/60 [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-text-secondary/60 [animation-delay:200ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-text-secondary/60 [animation-delay:400ms]" />
        </div>
        <p className="text-xs tracking-wide text-brand-text-secondary/80">
          Estimated time: 15–30 seconds.
        </p>
      </div>
    </div>
  );
}
