"use client";

import { motion } from "motion/react";
import { buttonStyles, formStyles, riseVariants } from "@/lib/design";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";

export function StepDates({ controller }: { controller: ReturnType<typeof useJourneyBuilder> }) {
  const { data, update, next, back } = controller;

  const canAdvance = !!data.durationDays || (!!data.startDate && !!data.endDate);

  return (
    <div className="flex flex-col flex-1">
      <motion.div variants={riseVariants} className="flex-1">
        <h3 className="font-display text-2xl font-light text-brand-text-primary mb-6">
          When will you be traveling?
        </h3>
        
        <div className="space-y-6 max-w-sm">
          <div className="space-y-2">
            <label className={formStyles.label}>Duration (Days)</label>
            <input
              type="number"
              min="1"
              max="30"
              className={formStyles.input}
              placeholder="e.g. 7"
              value={data.durationDays || ""}
              onChange={(e) => update("durationDays", parseInt(e.target.value, 10) || null)}
            />
          </div>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-brand-border"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-medium text-brand-text-secondary uppercase tracking-widest">Or Specific Dates</span>
            <div className="flex-grow border-t border-brand-border"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={formStyles.label}>Start Date</label>
              <input
                type="date"
                className={formStyles.input}
                value={data.startDate ? data.startDate.toISOString().split("T")[0] : ""}
                onChange={(e) => update("startDate", e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
            <div className="space-y-2">
              <label className={formStyles.label}>End Date</label>
              <input
                type="date"
                className={formStyles.input}
                value={data.endDate ? data.endDate.toISOString().split("T")[0] : ""}
                onChange={(e) => update("endDate", e.target.value ? new Date(e.target.value) : null)}
              />
            </div>
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
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance}
          className={buttonStyles.primary}
        >
          Continue
        </button>
      </motion.div>
    </div>
  );
}
