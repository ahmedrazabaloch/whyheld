"use client";

import { motion } from "motion/react";
import { LocationAutocomplete } from "@/components/location/LocationAutocomplete";
import { buttonStyles, riseVariants } from "@/lib/design";
import type { useJourneyBuilder } from "@/hooks/useJourneyBuilder";

export function StepDestination({ controller }: { controller: ReturnType<typeof useJourneyBuilder> }) {
  const { data, update, next } = controller;

  const canAdvance = !!data.originQuery && data.originQuery.length > 2;

  return (
    <div className="flex flex-col flex-1">
      <motion.div variants={riseVariants} className="flex-1">
        <h3 className="font-display text-2xl font-light text-brand-text-primary mb-6">
          Where are you dreaming of going?
        </h3>
        
        <LocationAutocomplete
          label="Primary Destination"
          placeholder="e.g. Kyoto, Japan or The Scottish Highlands"
          value={data.originQuery || ""}
          onChange={(placeId, desc) => {
            update("originQuery", desc);
            // Default the journey title to the destination
            if (data.title === "Untitled Journey") {
              update("title", `Journey to ${desc.split(",")[0]}`);
            }
          }}
        />
      </motion.div>

      <motion.div variants={riseVariants} className="mt-8 flex justify-end">
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
