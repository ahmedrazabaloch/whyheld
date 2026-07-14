import Link from "next/link";
import { surfaces, buttonStyles } from "@/lib/design";

export interface JourneyDraftCardProps {
  id: string;
  title: string;
  updatedDate: string;
}

export function JourneyDraftCard({ id, title, updatedDate }: JourneyDraftCardProps) {
  return (
    <div className={`h-full ${surfaces.card} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-shadow hover:shadow-md`}>
      <div>
        <h4 className="font-medium text-brand-text-primary truncate" title={title}>
          {title}
        </h4>
        <p className="text-xs text-brand-text-secondary mt-1">
          Last edited on {updatedDate}
        </p>
      </div>
      <Link 
        href={`/journeys/${id}/build`} 
        className="inline-flex min-h-[36px] items-center justify-center rounded-full bg-brand-border/40 px-4 py-1.5 text-xs font-medium text-brand-text-primary shadow-sm transition-all hover:bg-brand-border/60 whitespace-nowrap"
      >
        Continue
      </Link>
    </div>
  );
}
