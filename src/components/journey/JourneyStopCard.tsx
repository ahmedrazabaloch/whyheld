import { surfaces } from "@/lib/design";

export interface JourneyStopCardProps {
  order: number;
  name: string;
  description: string;
  highlights?: string[];
}

export function JourneyStopCard({
  order,
  name,
  description,
  highlights,
}: JourneyStopCardProps) {
  return (
    <div className={`${surfaces.card} overflow-hidden mb-6 p-6 sm:p-8 relative`}>
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-btn-primary" />
      
      <div className="mb-4">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-brand-text-secondary/80 mb-1">
          Stop {order}
        </p>
        <h3 className="font-display text-xl sm:text-2xl tracking-tight text-brand-text-primary">
          {name}
        </h3>
      </div>
      
      <p className="text-sm leading-relaxed text-brand-text-secondary">
        {description}
      </p>

      {highlights && highlights.length > 0 && (
        <div className="mt-6 pt-6 border-t border-brand-border/60">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-text-secondary mb-3">
            Highlights
          </p>
          <div className="flex flex-wrap gap-2">
            {highlights.map((highlight, idx) => (
              <span key={idx} className={surfaces.chip}>
                {highlight}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
