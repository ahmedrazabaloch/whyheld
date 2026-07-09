"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PageHeader } from "@/components/dashboard";
import { useJourneyBuilder } from "@/hooks/useJourneyBuilder";
import { useJourneyGeneration } from "@/hooks/useJourneyGeneration";
import { containerVariants } from "@/lib/design";
import type { Journey } from "@prisma/client";
import { useRouter } from "next/navigation";

import { StepDestination } from "./steps/StepDestination";
import { StepDates } from "./steps/StepDates";
import { StepStyle } from "./steps/StepStyle";
import { StepPreferences } from "./steps/StepPreferences";
import { StepReview } from "./steps/StepReview";
import { GeneratingState } from "./GeneratingState";

const STEPS = [
  { id: "destination", component: StepDestination, label: "The Destination" },
  { id: "dates", component: StepDates, label: "Dates & Duration" },
  { id: "style", component: StepStyle, label: "Travel Style" },
  { id: "preferences", component: StepPreferences, label: "Preferences" },
  { id: "review", component: StepReview, label: "Review" },
];

export function JourneyBuilder({ 
  draft,
  userCredits,
  userPlan
}: { 
  draft: Journey;
  userCredits: number;
  userPlan: string;
}) {
  const router = useRouter();
  const controller = useJourneyBuilder(draft);
  const { step, isSaving, data } = controller;
  
  const generation = useJourneyGeneration(draft.id, draft.status);

  // If generation is READY, redirect to the journey page (or render the ready state here).
  // In Phase 3, we redirect to the read-only view or map view once it's completely ready.
  useEffect(() => {
    if (generation.state === "READY") {
      router.push(`/journeys/${draft.id}`);
    }
  }, [generation.state, draft.id, router]);

  if (generation.state === "READY") {
    return null; // Return null while redirecting
  }

  const isGenerating = [
    "PREPARING",
    "STREAMING",
    "PERSISTING",
    "FAILED",
    "CANCELLED"
  ].includes(generation.state);

  const ActiveStep = STEPS[step]?.component;
  const currentLabel = STEPS[step]?.label || "";

  return (
    <>
      {!isGenerating && (
        <div className="flex items-center justify-between mb-8">
          <PageHeader
            eyebrow={`Step ${step + 1} of ${STEPS.length}`}
            title={currentLabel}
            description="Craft your perfect slow-travel experience."
          />
          <div className="text-xs font-medium text-brand-text-secondary h-6 flex items-center">
            {isSaving ? "Saving..." : "Saved"}
          </div>
        </div>
      )}

      <div className="rounded-[2rem] border border-brand-border/60 bg-brand-card shadow-sm overflow-hidden relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <GeneratingState
              key="generating"
              state={generation.state}
              statusMessage={generation.statusMessage}
              progress={generation.progress}
              days={generation.days}
              metadata={generation.metadata}
              error={generation.error}
              onAbort={generation.abort}
              onRetry={generation.retry}
              expectedDurationDays={data.durationDays || undefined}
            />
          ) : (
            <motion.div
              key={`step-${step}`}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -10 }}
              variants={containerVariants}
              className="p-6 sm:p-8 flex flex-col min-h-[400px]"
            >
              {ActiveStep ? (
                <ActiveStep 
                  controller={controller} 
                  onGenerate={generation.startGeneration}
                  userCredits={userCredits}
                  userPlan={userPlan}
                />
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
