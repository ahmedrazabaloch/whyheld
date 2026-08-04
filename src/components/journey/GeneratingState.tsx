"use client";

import { motion, AnimatePresence } from "motion/react";
import { buttonStyles } from "@/lib/design";
import { JourneyBeingCrafted } from "./JourneyBeingCrafted";
import {
  GenerationHero,
  GenerationTimeline,
  GenerationProgressBar,
  GenerationStatusChip,
  GenerationErrorState,
} from "./generation";
import type { GenerationState } from "@/hooks/useJourneyGeneration";

interface GeneratingStateProps {
  state: GenerationState;
  statusMessage: string;
  progress: number;
  days: any[];
  metadata: any;
  error: string | null;
  onAbort: () => void;
  onRetry: () => void;
  expectedDurationDays?: number;
  originQuery?: string | null;
  draftData?: any;
}

export function GeneratingState({
  state,
  statusMessage,
  progress,
  days,
  metadata,
  error,
  onAbort,
  onRetry,
  expectedDurationDays,
  originQuery,
  draftData,
}: GeneratingStateProps) {
  /* ── Error / Cancelled states ─────────────────────────────────────── */
  if (state === "FAILED" || state === "CANCELLED") {
    return (
      <GenerationErrorState
        type={state}
        error={error}
        onRetry={onRetry}
        onAbort={onAbort}
      />
    );
  }

  /* ── Active generation (PREPARING / STREAMING / PERSISTING) ────────── */
  // Destination for the hero should NOT be the full title.
  // We want just the country/region or originQuery.
  const heroDestination =
    draftData?.primaryCountry ||
    draftData?.originQuery ||
    originQuery ||
    "Your Journey";

  let calculatedProgress = 0;
  if (state === "PREPARING") {
    calculatedProgress = 10; // Connecting
  } else if (state === "STREAMING") {
    if (!metadata) {
      calculatedProgress = 20; // Meta not yet received
    } else {
      const daysCount = days.length;
      const total = expectedDurationDays || metadata.durationDays || 7;
      const daysProgress = total > 0 ? (daysCount / total) * 60 : 0;
      calculatedProgress = Math.min(25 + daysProgress, 85);
    }
  } else if (state === "PERSISTING") {
    calculatedProgress = 90;
  } else if (state === "READY") {
    calculatedProgress = 100;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* ── Two-column layout on md+ ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-8 w-full">

        {/* ── LEFT RAIL: Hero + Controls ─────────────────────────────── */}
        <div className="w-full md:w-[340px] flex-shrink-0 flex flex-col gap-6">

          {/* Destination hero */}
          <GenerationHero destination={heroDestination} state={state} />

          {/* Glassmorphism status chip */}
          <GenerationStatusChip message={statusMessage} state={state} />

          {/* Progress bar */}
          <div className="px-1">
            <GenerationProgressBar progress={calculatedProgress} state={state} />
          </div>

          {/* AI thinking timeline */}
          <div
            className="rounded-2xl px-5 py-6"
            style={{
              background: "rgba(255, 255, 255, 0.65)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(216, 210, 200, 0.5)",
              boxShadow: "0 4px 24px -8px rgba(51, 51, 47, 0.07)",
            }}
          >
            <p
              className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] mb-5"
              style={{ color: "rgba(168, 166, 157, 0.8)" }}
            >
              Generation steps
            </p>
            <GenerationTimeline progress={calculatedProgress} state={state} />
          </div>

          {/* Cancel button */}
          <div className="pb-1">
            <AnimatePresence>
              {state !== "PERSISTING" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    type="button"
                    onClick={onAbort}
                    className={`${buttonStyles.ghost} w-full justify-center text-sm`}
                    aria-label="Cancel journey generation"
                  >
                    Cancel generation
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            {state === "PERSISTING" && (
              <p
                className="text-center text-xs"
                style={{ color: "rgba(168, 166, 157, 0.7)" }}
              >
                Saving your itinerary — almost done…
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL: Live itinerary stream ─────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Metadata summary card — appears once AI has produced a title */}
          <AnimatePresence>
            {metadata && (
              <motion.div
                key="meta-card"
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl px-6 py-5 mb-6"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(116,135,107,0.08) 0%, rgba(180,160,120,0.06) 100%)",
                  border: "1px solid rgba(116, 135, 107, 0.2)",
                  boxShadow: "0 4px 24px -8px rgba(116, 135, 107, 0.12)",
                }}
              >
                {metadata.title && (
                  <h3
                    className="font-display text-2xl font-light leading-tight tracking-[-0.01em] mb-2"
                    style={{ color: "rgba(51, 51, 47, 1)" }}
                  >
                    {metadata.title}
                  </h3>
                )}
                {metadata.summary && (
                  <p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: "rgba(80, 79, 74, 0.85)" }}
                  >
                    {metadata.summary}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {(metadata.durationDays || expectedDurationDays) && (
                    <MetaStat
                      label="Est. Days"
                      value={`${metadata.durationDays || expectedDurationDays} days`}
                    />
                  )}
                  {draftData?.pace && (
                    <MetaStat
                      label="Pace"
                      value={draftData.pace.replace(/_/g, " ")}
                    />
                  )}
                  {(metadata.destination || heroDestination) && (
                    <MetaStat
                      label="Destination"
                      value={metadata.destination || heroDestination}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live itinerary cards */}
          <JourneyBeingCrafted
            days={days}
            expectedDurationDays={expectedDurationDays}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Tiny stat display inside metadata card ─────────────────────── */
function MetaStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span
        className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] mb-0.5"
        style={{ color: "rgba(168, 166, 157, 0.8)" }}
      >
        {label}
      </span>
      <span
        className="text-sm font-medium"
        style={{ color: "rgba(51, 51, 47, 0.9)" }}
      >
        {value}
      </span>
    </div>
  );
}
