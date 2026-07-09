import { motion } from "motion/react";
import { surfaces, buttonStyles } from "@/lib/design";

interface StopCardProps {
  stop: any;
  order: number;
}

export function StopCard({ stop, order }: StopCardProps) {
  return (
    <div className={`${surfaces.card} overflow-hidden mb-4 relative`}>
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary" />
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`${surfaces.chip} mb-2 inline-block`}>
            {stop.kind || "Destination"}
          </span>
          <h4 className="font-display text-xl text-brand-text-primary">
            Day {order}: {stop.name || "Unknown Stop"}
          </h4>
          <p className="text-sm text-brand-text-secondary">
            {stop.nights ? `${stop.nights} nights` : "Day trip"}
          </p>
        </div>
        <button className={`${buttonStyles.ghost} text-xs`}>Save place</button>
      </div>
      
      <p className="text-brand-text-primary font-medium mb-4 text-sm leading-relaxed">
        {stop.description || stop.summary}
      </p>

      {stop.highlights && stop.highlights.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-widest text-brand-text-secondary mb-2">
            Highlights
          </h5>
          <ul className="list-disc list-inside text-sm text-brand-text-primary space-y-1">
            {stop.highlights.map((highlight: string, idx: number) => (
              <li key={idx}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
