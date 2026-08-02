"use client";

import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Journey } from "@prisma/client";
import { useJourneyBuilder } from "@/hooks/useJourneyBuilder";
import { useJourneyGeneration } from "@/hooks/useJourneyGeneration";

import { StepDestination } from "./steps/StepDestination";
import { StepStyle } from "./steps/StepStyle";
import { StepLength } from "./steps/StepLength";
import { StepDates } from "./steps/StepDates";
import { StepPreferences } from "./steps/StepPreferences";
import { StepReview } from "./steps/StepReview";
import { GeneratingState } from "./GeneratingState";
import {
  JourneyRibbon,
  SETUP_STAGES,
  type SetupStageId,
} from "./JourneyRibbon";

function EditorialBridge({ children }: { children: ReactNode }) {
  return (
    <p
      className="flex items-center gap-3 py-1 text-[0.8rem] italic leading-relaxed text-brand-text-secondary/70"
      aria-hidden
    >
      <span className="h-px w-5 shrink-0 bg-brand-border" />
      <span>{children}</span>
    </p>
  );
}

export function JourneyBuilder({
  draft,
  userCredits,
  userPlan,
}: {
  draft: Journey;
  userCredits: number;
  userPlan: string;
}) {
  const router = useRouter();
  const controller = useJourneyBuilder(draft);
  const { isSaving, data } = controller;

  const generation = useJourneyGeneration(draft.id, draft.status);
  const [activeId, setActiveId] = useState<SetupStageId>("destination");
  const [scrollMarginPx, setScrollMarginPx] = useState(120);

  const handleScrollMarginChange = useCallback((px: number) => {
    setScrollMarginPx(px);
  }, []);

  useEffect(() => {
    if (generation.state === "READY") {
      router.push(`/journeys/${draft.id}`);
    }
  }, [generation.state, draft.id, router]);

  // Scroll-spy — marker sits just below the sticky ribbon clearance.
  useEffect(() => {
    const ids = SETUP_STAGES.map((s) => s.id);

    const updateActive = () => {
      const marker = scrollMarginPx + 8;
      let current: SetupStageId = ids[0];
      let best = Number.POSITIVE_INFINITY;

      for (const id of ids) {
        const el = document.getElementById(`setup-${id}`);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        const distance = Math.abs(top - marker);
        if (top <= marker + 40 && distance < best) {
          best = distance;
          current = id;
        }
      }

      const first = document.getElementById(`setup-${ids[0]}`);
      if (first && first.getBoundingClientRect().top > marker + 40) {
        current = ids[0];
      }

      setActiveId((prev) => (prev === current ? prev : current));
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, [scrollMarginPx]);

  if (generation.state === "READY") {
    return null;
  }

  const isGenerating = [
    "PREPARING",
    "STREAMING",
    "PERSISTING",
    "FAILED",
    "CANCELLED",
  ].includes(generation.state);

  if (isGenerating) {
    return (
      <GeneratingState
        state={generation.state}
        statusMessage={generation.statusMessage}
        progress={generation.progress}
        days={generation.days}
        metadata={generation.metadata}
        error={generation.error}
        onAbort={generation.abort}
        onRetry={generation.retry}
        expectedDurationDays={data.durationDays || undefined}
        originQuery={data.originQuery}
        draftData={data}
      />
    );
  }

  const canBegin =
    !!data.originQuery &&
    data.originQuery.length > 2 &&
    (!!data.durationDays || (!!data.startDate && !!data.endDate)) &&
    !!data.pace &&
    !!data.budget;

  const completed: Record<SetupStageId, boolean> = {
    destination: !!data.originQuery && data.originQuery.length > 2,
    "journey-feel": !!data.pace,
    "journey-length": !!data.durationDays,
    "travel-dates": !!data.startDate && !!data.endDate,
    "travel-style": !!data.budget,
    review: canBegin,
  };

  const setupStyle = {
    ["--setup-scroll-margin" as string]: `${scrollMarginPx}px`,
  } as CSSProperties;

  return (
    <div className="mx-auto w-full max-w-3xl" style={setupStyle}>
      <header className="mb-8 flex items-start justify-between gap-6 sm:mb-10">
        <div className="max-w-xl space-y-4">
          <h1 className="font-display text-3xl font-light tracking-tight text-brand-text-primary sm:text-4xl">
            Begin a New Journey
          </h1>
          <div className="space-y-1 text-base leading-relaxed text-brand-text-secondary sm:text-lg">
            <p>Every meaningful journey begins with a place.</p>
            <p>Tell us where you&apos;re feeling called.</p>
          </div>
        </div>
        <p
          className="shrink-0 pt-2 text-xs text-brand-text-secondary"
          aria-live="polite"
        >
          {isSaving ? "Saving…" : ""}
        </p>
      </header>

      <JourneyRibbon
        activeId={activeId}
        completed={completed}
        onScrollMarginChange={handleScrollMarginChange}
      />

      <div className="mt-10 flex flex-col gap-12 sm:mt-12 sm:gap-14">
        <StepDestination controller={controller} />

        <EditorialBridge>Every place has its own rhythm.</EditorialBridge>

        <StepStyle controller={controller} />

        <EditorialBridge>Time changes everything.</EditorialBridge>

        <StepLength controller={controller} />

        <EditorialBridge>Some journeys unfold slowly.</EditorialBridge>

        <StepDates controller={controller} />

        <EditorialBridge>
          Comfort shapes experience differently for everyone.
        </EditorialBridge>

        <StepPreferences controller={controller} />

        <div className="border-t border-brand-border/50 pt-12 sm:pt-14">
          <StepReview
            controller={controller}
            onGenerate={() => {
              controller.flushSave();
              router.push(`/journeys/${draft.id}/discover`);
            }}
            userCredits={userCredits}
            userPlan={userPlan}
            canBegin={canBegin}
          />
        </div>
      </div>
    </div>
  );
}
