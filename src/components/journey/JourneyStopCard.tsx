import { surfaces } from "@/lib/design";

export interface JourneyStopCardProps {
  order: number;
  name: string;
  description: string;
  highlights?: string[];
  metadata?: any;
}

export function JourneyStopCard({
  order,
  name,
  description,
  highlights,
  metadata,
}: JourneyStopCardProps) {
  // Gracefully extract time blocks if they exist in metadata, otherwise fallback to parsing description, or just show description.
  const morning = metadata?.morning;
  const afternoon = metadata?.afternoon;
  const evening = metadata?.evening;
  const travelNotes = metadata?.travelNotes;
  
  const hasStructuredTime = morning || afternoon || evening;

  return (
    <div
      className="overflow-hidden mb-8 p-8 relative rounded-3xl"
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        border: "1px solid rgba(216, 210, 200, 0.6)",
        boxShadow: "0 12px 48px -12px rgba(51, 51, 47, 0.08)",
      }}
    >
      {/* Elegant Accent line */}
      <div
        className="absolute top-0 left-0 w-[4px] h-full rounded-l-3xl"
        style={{ background: "rgba(116, 135, 107, 0.85)" }}
      />
      
      <div className="mb-6 ml-2">
        <p
          className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] mb-2 inline-block px-2.5 py-1 rounded-full"
          style={{
            color: "rgba(116, 135, 107, 0.95)",
            background: "rgba(116, 135, 107, 0.1)",
            border: "1px solid rgba(116, 135, 107, 0.2)",
          }}
        >
          Day {order}
        </p>
        <h3
          className="font-display text-2xl sm:text-3xl font-light tracking-[-0.01em] mt-1"
          style={{ color: "rgba(51, 51, 47, 1)" }}
        >
          {name}
        </h3>
      </div>
      
      <div className="ml-2">
        {hasStructuredTime ? (
          <div className="space-y-6 mt-6">
            {morning && <TimeBlock label="Morning" content={morning} />}
            {afternoon && <TimeBlock label="Afternoon" content={afternoon} />}
            {evening && <TimeBlock label="Evening" content={evening} />}
            {description && !metadata?.ignoreDescription && (
              <TimeBlock label="Overview" content={description} />
            )}
          </div>
        ) : (
          <p
            className="text-sm leading-relaxed mb-6"
            style={{ color: "rgba(80, 79, 74, 0.85)" }}
          >
            {description}
          </p>
        )}

        {travelNotes && (
          <div className="mt-6 pt-6 border-t border-brand-border/40">
            <p
              className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] mb-3"
              style={{ color: "rgba(168, 166, 157, 0.9)" }}
            >
              Travel Notes
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(80, 79, 74, 0.85)" }}
            >
              {travelNotes}
            </p>
          </div>
        )}

        {highlights && highlights.length > 0 && (
          <div className="mt-6 pt-6 border-t border-brand-border/40">
            <p
              className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] mb-3"
              style={{ color: "rgba(168, 166, 157, 0.9)" }}
            >
              Highlights
            </p>
            <ul className="space-y-2">
              {highlights.map((highlight, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm"
                  style={{ color: "rgba(80, 79, 74, 0.85)" }}
                >
                  <span
                    className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ background: "rgba(116, 135, 107, 0.6)" }}
                  />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function TimeBlock({ label, content }: { label: string; content: string }) {
  return (
    <div>
      <p
        className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] mb-1.5"
        style={{ color: "rgba(168, 166, 157, 0.9)" }}
      >
        {label}
      </p>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "rgba(80, 79, 74, 0.85)" }}
      >
        {content}
      </p>
    </div>
  );
}
