import { motion } from "motion/react";
import { buttonStyles, containerVariants, riseVariants } from "@/lib/design";
import { JourneyBeingCrafted } from "./JourneyBeingCrafted";
import { GenerationSummary } from "./GenerationSummary";
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
}: GeneratingStateProps) {
  
  if (state === "FAILED") {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center justify-center flex-1 py-12 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="font-display text-2xl font-light text-brand-text-primary mb-2">
          Generation Failed
        </h3>
        <p className="text-brand-text-secondary max-w-md mb-8">
          {error || "An unexpected error occurred while communicating with the AI. Your credit was not charged."}
        </p>
        <div className="flex gap-4">
          <button onClick={onAbort} className={buttonStyles.ghost}>Cancel</button>
          <button onClick={onRetry} className={buttonStyles.primary}>Try Again</button>
        </div>
      </motion.div>
    );
  }

  if (state === "CANCELLED") {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center justify-center flex-1 py-12 text-center"
      >
        <h3 className="font-display text-2xl font-light text-brand-text-primary mb-2">
          Generation Cancelled
        </h3>
        <p className="text-brand-text-secondary max-w-md mb-8">
          You cancelled the generation process. Your credit was not charged.
        </p>
        <button onClick={onAbort} className={buttonStyles.primary}>Return to Builder</button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="flex flex-col flex-1 w-full max-w-4xl mx-auto relative"
    >
      <div className="sticky top-0 z-10 bg-brand-card/90 backdrop-blur-sm pb-6 pt-2 border-b border-brand-border/40 mb-8">
        <div className="flex items-center justify-between mb-4">
          <motion.h3 
            variants={riseVariants}
            className="font-display text-2xl font-light text-brand-text-primary"
          >
            {statusMessage || "Crafting your journey..."}
          </motion.h3>
          <button 
            onClick={onAbort} 
            className={`${buttonStyles.ghost} text-sm`}
            disabled={state === "PERSISTING"}
          >
            {state === "PERSISTING" ? "Finalizing..." : "Cancel"}
          </button>
        </div>
        
        {/* Progress Bar */}
        <motion.div variants={riseVariants} className="w-full h-1 bg-brand-border/40 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-brand-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50, damping: 15 }}
          />
        </motion.div>
      </div>

      <GenerationSummary metadata={metadata} daysCount={days.length} />
      
      <JourneyBeingCrafted days={days} expectedDurationDays={expectedDurationDays} />
      
    </motion.div>
  );
}
