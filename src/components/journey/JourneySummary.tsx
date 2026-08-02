import { surfaces } from "@/lib/design";

export interface JourneySummaryProps {
  summary: string;
  destination: string;
  pace: string;
  budget: string;
  /** Section heading. Defaults to "Journey Summary". */
  heading?: string;
}

export function JourneySummary({
  summary,
  destination,
  pace,
  budget,
  heading = "Journey Summary",
}: JourneySummaryProps) {
  return (
    <div className={`${surfaces.card} p-6 sm:p-8`}>
      <h2 className="font-display text-xl text-brand-text-primary mb-4">
        {heading}
      </h2>
      <p className="text-sm leading-relaxed text-brand-text-secondary mb-8">
        {summary}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-brand-border/60">
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-brand-text-secondary/80">
            Destination
          </p>
          <p className="mt-2 font-display text-lg tracking-tight text-brand-text-primary truncate" title={destination}>
            {destination}
          </p>
        </div>
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-brand-text-secondary/80">
            Travel Pace
          </p>
          <p className="mt-2 font-display text-lg tracking-tight text-brand-text-primary">
            {pace}
          </p>
        </div>
        <div>
          <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-brand-text-secondary/80">
            Budget
          </p>
          <p className="mt-2 font-display text-lg tracking-tight text-brand-text-primary">
            {budget}
          </p>
        </div>
      </div>
    </div>
  );
}
