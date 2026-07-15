"use client";

import { motion } from "motion/react";
import { buttonStyles, formStyles, riseVariants } from "@/lib/design";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

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
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                update("durationDays", val > 0 ? val : null);
                // Mutual exclusivity: clear specific dates when duration is entered
                if (val > 0) {
                  update("startDate", null);
                  update("endDate", null);
                }
              }}
            />
          </div>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-brand-border"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-medium text-brand-text-secondary uppercase tracking-widest">Or Specific Dates</span>
            <div className="flex-grow border-t border-brand-border"></div>
          </div>
          <div className="space-y-2">
            <label className={formStyles.label}>Select Dates</label>
            <DateRangePicker
              startDate={data.startDate}
              endDate={data.endDate}
              onUpdate={(start, end) => {
                if (start !== data.startDate) update("startDate", start);
                if (end !== data.endDate) update("endDate", end);
                // Mutual exclusivity: clear duration when specific dates are selected
                if ((start || end) && data.durationDays !== null) {
                  update("durationDays", null);
                }
              }}
            />
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
