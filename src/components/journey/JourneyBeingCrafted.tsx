import { motion, AnimatePresence } from "motion/react";
import { riseVariants } from "@/lib/design";
import { StopCard } from "./StopCard";

interface JourneyBeingCraftedProps {
  days: any[];
  expectedDurationDays?: number;
}

export function JourneyBeingCrafted({ days, expectedDurationDays = 7 }: JourneyBeingCraftedProps) {
  // If we have an expected duration, we can render skeleton cards for the remaining days
  const skeletonCount = Math.max(0, expectedDurationDays - days.length);

  return (
    <div className="flex-1 w-full flex flex-col mt-8 relative">
      <div className="absolute left-6 top-4 bottom-4 w-px bg-brand-border/40 hidden md:block" />
      <div className="space-y-6 md:pl-12 w-full">
        <AnimatePresence>
          {days.map((day, index) => (
            <motion.div
              key={`day-${index}`}
              initial="hidden"
              animate="show"
              variants={riseVariants}
            >
              <StopCard stop={day} order={index + 1} />
            </motion.div>
          ))}
          {skeletonCount > 0 && Array.from({ length: skeletonCount }).map((_, index) => (
            <motion.div
              key={`skeleton-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="rounded-xl border border-brand-border/60 bg-brand-card p-6 min-h-[150px] animate-pulse relative"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-border/40" />
              <div className="h-4 bg-brand-border/60 rounded w-1/4 mb-4" />
              <div className="h-6 bg-brand-border/60 rounded w-2/3 mb-2" />
              <div className="h-4 bg-brand-border/60 rounded w-1/3 mb-6" />
              <div className="space-y-2">
                <div className="h-3 bg-brand-border/60 rounded w-full" />
                <div className="h-3 bg-brand-border/60 rounded w-5/6" />
                <div className="h-3 bg-brand-border/60 rounded w-4/6" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
