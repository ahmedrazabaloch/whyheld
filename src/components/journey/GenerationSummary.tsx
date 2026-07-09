import { motion } from "motion/react";
import { riseVariants } from "@/lib/design";

interface GenerationSummaryProps {
  metadata: any;
  daysCount: number;
}

export function GenerationSummary({ metadata, daysCount }: GenerationSummaryProps) {
  if (!metadata) return null;

  return (
    <motion.div 
      variants={riseVariants}
      className="mt-6 p-6 rounded-xl bg-brand-surface border border-brand-border/40 w-full"
    >
      <h3 className="font-display text-2xl text-brand-text-primary mb-2">
        {metadata.title || "Your Journey"}
      </h3>
      {metadata.summary && (
        <p className="text-brand-text-secondary text-sm mb-6 leading-relaxed max-w-2xl">
          {metadata.summary}
        </p>
      )}
      
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-brand-text-secondary mb-1">
            Days
          </span>
          <span className="font-medium text-brand-text-primary">
            {metadata.durationDays || daysCount}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-brand-text-secondary mb-1">
            Stops
          </span>
          <span className="font-medium text-brand-text-primary">
            {daysCount}
          </span>
        </div>
        {metadata.estimatedDrivingHours && (
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-widest text-brand-text-secondary mb-1">
              Est. Driving
            </span>
            <span className="font-medium text-brand-text-primary">
              {metadata.estimatedDrivingHours} hours
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
