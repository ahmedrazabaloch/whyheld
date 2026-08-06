"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Journey } from "@prisma/client";
import { useJourneyBuilder } from "@/hooks/useJourneyBuilder";
import { useJourneyGeneration } from "@/hooks/useJourneyGeneration";
import { buttonStyles, EASE_EXPO } from "@/lib/design";
import { feelingLabels } from "@/lib/journey/feelings";

import { StepDestination } from "./steps/StepDestination";
import { StepStyle } from "./steps/StepStyle";
import { StepAlongTheWay } from "./steps/StepAlongTheWay";
import { StepWhen } from "./steps/StepWhen";
import { StepReview } from "./steps/StepReview";
import { GeneratingState } from "./GeneratingState";
import {
  JourneyRibbon,
  SETUP_STAGES,
  EXPLORE_STAGES,
  type SetupStageId,
} from "./JourneyRibbon";

const STEP_BRIDGES: Partial<Record<SetupStageId, string>> = {
  "journey-feel": "Some paths ask for a beginning and an end.",
  "along-the-way": "Time changes everything.",
  when: "Some journeys unfold slowly.",
};

function firstIncompleteStep(
  stages: typeof SETUP_STAGES,
  completed: Record<SetupStageId, boolean>,
): SetupStageId {
  for (const stage of stages) {
    if (stage.id === "review") continue;
    if (!completed[stage.id]) return stage.id;
  }
  return "review";
}

function EditorialBridge({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[0.8rem] italic leading-relaxed text-brand-text-secondary/70">
      <span className="h-px w-5 shrink-0 bg-brand-border" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

export function JourneyBuilder({
  draft,
  userCredits,
  userPlan,
  showBookSuggestions = false,
}: {
  draft: Journey;
  userCredits: number;
  userPlan: string;
  /** Server-gated Bookshop.org prompt — US profiles only. */
  showBookSuggestions?: boolean;
}) {
  const router = useRouter();
  const controller = useJourneyBuilder(draft);
  const { isSaving, data } = controller;

  const generation = useJourneyGeneration(draft.id, draft.status);
  const isExplore = data.intent === "explore";
  const stages = isExplore ? EXPLORE_STAGES : SETUP_STAGES;

  const completed = useMemo<Record<SetupStageId, boolean>>(() => {
    const hasTime =
      !!data.durationDays || (!!data.startDate && !!data.endDate);
    const destinationOk = !!data.originQuery && data.originQuery.length > 2;
    const feelOk = (data.feelings?.length ?? 0) > 0;
    const tripShape = data.tripShape;
    const alongOk = !!(
      tripShape?.startPoint?.name ||
      tripShape?.endPoint?.name ||
      (tripShape?.mustVisit?.length ?? 0) > 0
    );

    if (isExplore) {
      const canBegin = destinationOk && feelOk;
      return {
        destination: destinationOk,
        "journey-feel": feelOk,
        "along-the-way": alongOk,
        when: true,
        review: canBegin,
      };
    }

    const canBegin = destinationOk && hasTime && feelOk;

    return {
      destination: destinationOk,
      "journey-feel": feelOk,
      "along-the-way": alongOk,
      when: hasTime,
      review: canBegin,
    };
  }, [data, isExplore]);

  const canBegin = completed.review;

  const [activeId, setActiveId] = useState<SetupStageId>(() =>
    firstIncompleteStep(stages, completed),
  );

  const activeIndex = stages.findIndex((s) => s.id === activeId);

  const reachableIds = useMemo(() => {
    const ids: SetupStageId[] = [stages[0]!.id];
    for (let i = 1; i < stages.length; i++) {
      const prev = stages[i - 1]!;
      const stage = stages[i]!;
      if (completed[prev.id] || i <= activeIndex || completed[stage.id]) {
        ids.push(stage.id);
      } else {
        break;
      }
    }
    for (const stage of stages) {
      if ((completed[stage.id] || stage.id === activeId) && !ids.includes(stage.id)) {
        ids.push(stage.id);
      }
    }
    return ids;
  }, [completed, activeId, activeIndex, stages]);

  useEffect(() => {
    if (generation.state === "READY") {
      router.push(`/journeys/${draft.id}`);
    }
  }, [generation.state, draft.id, router]);

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
        expectedDurationDays={
          data.durationDays ||
          (data.startDate && data.endDate
            ? Math.max(
                1,
                Math.round(
                  (data.endDate.getTime() - data.startDate.getTime()) /
                    (1000 * 60 * 60 * 24),
                ) + 1,
              )
            : undefined)
        }
        originQuery={data.originQuery}
        draftData={data}
      />
    );
  }

  const canContinue = (() => {
    switch (activeId) {
      case "destination":
        return completed.destination;
      case "journey-feel":
        return completed["journey-feel"];
      case "along-the-way":
        return true;
      case "when":
        return completed.when;
      case "review":
        return canBegin;
      default:
        return false;
    }
  })();

  const goNext = () => {
    if (!canContinue) return;
    // Quiet defaults for AI (not collected in setup — absent from client docs)
    if (isExplore && activeId === "journey-feel") {
      if (!data.durationDays) controller.update("durationDays", 5);
    }
    if (!data.budget) controller.update("budget", "COMFORTABLE");
    const next = stages[activeIndex + 1];
    if (next) setActiveId(next.id);
  };

  const goBack = () => {
    const prev = stages[activeIndex - 1];
    if (prev) setActiveId(prev.id);
  };

  const bridge = STEP_BRIDGES[activeId];
  const feelingLine = feelingLabels(data.feelings).join(", ");

  return (
    <div className="w-full pb-16">
      <header className="relative mb-6 min-h-[10.5rem] overflow-hidden sm:mb-8 sm:min-h-[12.5rem]">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[52%] sm:block"
          aria-hidden
        >
          <div
            className="relative h-full min-h-[11rem] w-full"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, black 18%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 18%, black 92%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)",
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          >
            <div className="absolute inset-x-0 top-[-18%] h-[130%]">
              <Image
                src="/illustrations/landscape.png"
                alt=""
                fill
                className="object-contain object-right"
                sizes="(min-width: 640px) 42vw, 0px"
                priority
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-start justify-between gap-6">
          <div className="max-w-xl space-y-3.5 pb-2 sm:pb-4">
            <p className="flex items-center gap-2.5 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-brand-text-muted">
              <span
                className="h-px w-4 shrink-0 bg-brand-text-muted/70"
                aria-hidden
              />
              {isExplore ? "Explore" : "New Journey"}
            </p>
            <h1 className="font-display text-3xl font-medium tracking-tight text-brand-text-primary sm:text-[2.5rem] sm:leading-[1.15]">
              {isExplore ? "Explore a Place" : "Begin a New Journey"}
            </h1>
            <p className="max-w-md text-base leading-relaxed text-brand-text-secondary sm:text-[1.05rem]">
              {isExplore
                ? "Explore with intention. Enter a town, region, or route that has been calling."
                : "Every meaningful journey begins with a place. Tell us where you\u2019re feeling called."}
            </p>
            {feelingLine ? (
              <p className="text-xs tracking-wide text-brand-text-secondary/80">
                Feeling — {feelingLine}
              </p>
            ) : null}
          </div>
          <p
            className="relative z-10 shrink-0 pt-1 text-xs text-brand-text-secondary"
            aria-live="polite"
          >
            {isSaving ? "Saving…" : ""}
          </p>
        </div>
      </header>

      <JourneyRibbon
        activeId={activeId}
        completed={completed}
        reachableIds={reachableIds}
        onSelect={setActiveId}
        stages={stages}
      />

      <div className="mt-8 rounded-2xl border border-brand-border/60 bg-brand-card p-6 shadow-sm sm:mt-10 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeId}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE_EXPO }}
            className="space-y-8"
          >
            {activeId === "destination" && (
              <StepDestination controller={controller} />
            )}
            {activeId === "journey-feel" && (
              <StepStyle controller={controller} />
            )}
            {activeId === "along-the-way" && (
              <StepAlongTheWay controller={controller} />
            )}
            {activeId === "when" && <StepWhen controller={controller} />}
            {activeId === "review" && (
              <StepReview
                controller={controller}
                showBookSuggestions={showBookSuggestions}
              />
            )}

            {bridge && activeId !== "review" && (
              <EditorialBridge>{bridge}</EditorialBridge>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-border/40 pt-6">
              {activeIndex > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className={buttonStyles.secondary}
                >
                  Back
                </button>
              ) : (
                <span />
              )}

              {activeId === "review" ? (
                userPlan !== "PREMIUM" && userCredits <= 0 ? (
                  <Link href="/billing" className={buttonStyles.primary}>
                    Choose a Plan
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!data.budget) {
                        controller.update("budget", "COMFORTABLE");
                      }
                      void controller.flushSave().then(() => {
                        router.push(`/journeys/${draft.id}/discover`);
                      });
                    }}
                    disabled={!canBegin}
                    className={buttonStyles.primary}
                  >
                    Begin Exploring
                    <span aria-hidden className="text-base leading-none">
                      →
                    </span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canContinue}
                  className={buttonStyles.primary}
                >
                  Continue
                  <span aria-hidden className="text-base leading-none">
                    →
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
