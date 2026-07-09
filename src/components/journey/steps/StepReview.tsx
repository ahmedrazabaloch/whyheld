"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { buttonStyles, riseVariants } from "@/lib/design";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";

export function StepReview({ 
  controller,
  onGenerate,
  userCredits = 0,
  userPlan = "FREE"
}: { 
  controller: ReturnType<typeof useJourneyBuilder>;
  onGenerate?: () => void;
  userCredits?: number;
  userPlan?: string;
}) {
  const { data, back, goTo, flushSave } = controller;

  const handleGenerate = () => {
    flushSave();
    if (onGenerate) {
      onGenerate();
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <motion.div variants={riseVariants} className="flex-1">
        <h3 className="font-display text-2xl font-light text-brand-text-primary mb-6">
          Review your journey
        </h3>
        
        <div className="space-y-6">
          <div className="rounded-xl border border-brand-border/60 p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xs font-medium uppercase tracking-widest text-brand-text-secondary">Destination</h4>
              <button onClick={() => goTo(0)} className="text-sm text-brand-btn-primary hover:underline">Edit</button>
            </div>
            <p className="text-brand-text-primary font-medium">{data.originQuery || "Not selected"}</p>
          </div>

          <div className="rounded-xl border border-brand-border/60 p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xs font-medium uppercase tracking-widest text-brand-text-secondary">Dates</h4>
              <button onClick={() => goTo(1)} className="text-sm text-brand-btn-primary hover:underline">Edit</button>
            </div>
            <p className="text-brand-text-primary font-medium">
              {data.startDate && data.endDate 
                ? `${data.startDate.toLocaleDateString()} to ${data.endDate.toLocaleDateString()}`
                : data.durationDays ? `${data.durationDays} Days` : "Not selected"}
            </p>
          </div>

          <div className="rounded-xl border border-brand-border/60 p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xs font-medium uppercase tracking-widest text-brand-text-secondary">Travel Style</h4>
              <button onClick={() => goTo(2)} className="text-sm text-brand-btn-primary hover:underline">Edit</button>
            </div>
            <p className="text-brand-text-primary font-medium">{data.pace ? data.pace.replace(/_/g, " ") : "Not selected"}</p>
          </div>

          <div className="rounded-xl border border-brand-border/60 p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-xs font-medium uppercase tracking-widest text-brand-text-secondary">Budget</h4>
              <button onClick={() => goTo(3)} className="text-sm text-brand-btn-primary hover:underline">Edit</button>
            </div>
            <p className="text-brand-text-primary font-medium">{data.budget || "Not selected"}</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={riseVariants} className="mt-8 flex justify-between">
        <button
          type="button"
          onClick={back}
          className={buttonStyles.ghost}
        >
          Back
        </button>
        
        {userPlan !== "PREMIUM" && userCredits <= 0 ? (
          <Link
            href="/billing"
            className={buttonStyles.primary}
          >
            Choose a Plan
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleGenerate}
            className={buttonStyles.primary}
          >
            Generate Journey
          </button>
        )}
      </motion.div>
    </div>
  );
}
