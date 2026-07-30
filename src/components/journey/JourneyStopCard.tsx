import { surfaces } from "@/lib/design";

export interface JourneyStopCardProps {
  order: number;
  name: string;
  kind?: string;
  description: string;
  highlights?: string[];
  metadata?: any;
}

export function JourneyStopCard({
  order,
  name,
  kind,
  description,
  highlights,
  metadata,
}: JourneyStopCardProps) {
  const morning = metadata?.morning;
  const afternoon = metadata?.afternoon;
  const evening = metadata?.evening;
  const travelNotes = metadata?.travelNotes;
  const localTips = metadata?.localTips;
  const hiddenGems = metadata?.hiddenGems;
  const logistics = metadata?.logistics;

  const hasStructuredTime = morning || afternoon || evening;

  return (
    <div
      className="overflow-hidden mb-6 p-6 sm:p-7 relative rounded-3xl transition-all duration-300"
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        border: "1px solid rgba(216, 210, 200, 0.6)",
        boxShadow: "0 10px 40px -12px rgba(51, 51, 47, 0.08)",
      }}
    >
      {/* Accent line */}
      <div
        className="absolute top-0 left-0 w-[4px] h-full rounded-l-3xl"
        style={{ background: "rgba(116, 135, 107, 0.85)" }}
      />
      
      <div className="mb-4 ml-1">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] px-2.5 py-0.5 rounded-full"
              style={{
                color: "rgba(116, 135, 107, 0.95)",
                background: "rgba(116, 135, 107, 0.1)",
                border: "1px solid rgba(116, 135, 107, 0.2)",
              }}
            >
              Stop #{order}
            </span>
            {kind && (
              <span
                className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full"
                style={{
                  color: "rgba(116, 135, 107, 0.9)",
                  background: "rgba(244, 241, 235, 0.8)",
                  border: "1px solid rgba(216, 210, 200, 0.5)",
                }}
              >
                {kind.replace(/_/g, " ")}
              </span>
            )}
          </div>
          {logistics?.estimatedCost && (
            <span className="text-xs text-brand-text-secondary bg-brand-bg/80 border border-brand-border/40 px-2.5 py-0.5 rounded-full font-medium">
              🏷️ {logistics.estimatedCost}
            </span>
          )}
        </div>
        <h4
          className="font-display text-2xl font-normal tracking-[-0.01em] text-brand-text-primary"
        >
          {name}
        </h4>
      </div>
      
      <div className="ml-1">
        {description && (
          <p
            className="text-sm leading-relaxed mb-4 text-brand-text-secondary/90 font-light"
          >
            {description}
          </p>
        )}

        {hasStructuredTime && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4 p-4 rounded-2xl bg-[#F8F6F0]/70 border border-brand-border/40">
            {morning && <TimeBlock label="Morning" content={morning} />}
            {afternoon && <TimeBlock label="Afternoon" content={afternoon} />}
            {evening && <TimeBlock label="Evening" content={evening} />}
          </div>
        )}

        {(hiddenGems || localTips || travelNotes) && (
          <div className="space-y-2 my-4">
            {hiddenGems && (
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-900/90 flex items-start gap-2">
                <span className="shrink-0 text-sm">💎</span>
                <div>
                  <strong className="font-semibold uppercase tracking-wider text-[0.65rem] block mb-0.5 text-amber-900">Hidden Gem</strong>
                  {hiddenGems}
                </div>
              </div>
            )}
            {localTips && (
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-900/90 flex items-start gap-2">
                <span className="shrink-0 text-sm">💡</span>
                <div>
                  <strong className="font-semibold uppercase tracking-wider text-[0.65rem] block mb-0.5 text-emerald-900">Local Tip</strong>
                  {localTips}
                </div>
              </div>
            )}
            {travelNotes && (
              <div className="p-3 rounded-xl bg-brand-bg/60 border border-brand-border/40 text-xs text-brand-text-secondary flex items-start gap-2">
                <span className="shrink-0 text-sm">🧭</span>
                <div>
                  <strong className="font-semibold uppercase tracking-wider text-[0.65rem] block mb-0.5 text-brand-text-primary">Travel Notes</strong>
                  {travelNotes}
                </div>
              </div>
            )}
          </div>
        )}

        {highlights && highlights.length > 0 && (
          <div className="mt-4 pt-4 border-t border-brand-border/40">
            <p
              className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] mb-2 text-brand-text-secondary/80"
            >
              Highlights
            </p>
            <ul className="space-y-1.5">
              {highlights.map((highlight, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-brand-text-secondary"
                >
                  <span
                    className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-brand-btn-primary/70"
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
        className="text-[0.6rem] font-semibold uppercase tracking-[0.22em] mb-1 text-brand-text-secondary/80"
      >
        {label}
      </p>
      <p
        className="text-xs leading-relaxed text-brand-text-primary/90"
      >
        {content}
      </p>
    </div>
  );
}
