"use client";

import { motion, AnimatePresence } from "motion/react";
import { SkeletonDayCard } from "./generation/SkeletonDayCard";

function LiveDayCard({ day, order }: { day: any; order: number }) {
  const dayNumber = day.dayNumber || order;
  const theme = day.theme;
  const summary = day.summary || day.description;
  const stops = Array.isArray(day.stops) ? day.stops : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl mb-6"
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        border: "1px solid rgba(216, 210, 200, 0.6)",
        boxShadow: "0 12px 48px -12px rgba(51, 51, 47, 0.08)",
      }}
    >
      {/* Accent line */}
      <div
        className="absolute top-0 left-0 w-[4px] h-full rounded-l-3xl"
        style={{ background: "rgba(116, 135, 107, 0.85)" }}
      />

      <div className="p-6 sm:p-8 pl-8 sm:pl-10">
        {/* Day header */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span
            className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] px-3 py-1 rounded-full"
            style={{
              color: "rgba(116, 135, 107, 0.95)",
              background: "rgba(116, 135, 107, 0.1)",
              border: "1px solid rgba(116, 135, 107, 0.25)",
            }}
          >
            Day {dayNumber}
          </span>
          {theme && (
            <span
              className="text-xs font-medium tracking-wide font-display text-brand-text-primary/90"
            >
              • {theme}
            </span>
          )}
        </div>

        {summary && (
          <p
            className="text-sm leading-relaxed mb-6 text-brand-text-secondary/90 font-light"
          >
            {summary}
          </p>
        )}

        {/* Nested Stops */}
        {stops.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-brand-border/40">
            {stops.map((stop: any, sIdx: number) => {
              const morning = stop.metadata?.morning;
              const afternoon = stop.metadata?.afternoon;
              const evening = stop.metadata?.evening;
              const localTips = stop.metadata?.localTips;
              const hiddenGems = stop.metadata?.hiddenGems;
              const logistics = stop.metadata?.logistics;

              return (
                <div
                  key={sIdx}
                  className="rounded-2xl p-4 sm:p-5"
                  style={{
                    background: "rgba(244, 241, 235, 0.6)",
                    border: "1px solid rgba(216, 210, 200, 0.4)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h5 className="font-display text-lg font-normal text-brand-text-primary">
                      {stop.name}
                    </h5>
                    {stop.kind && (
                      <span
                        className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full shrink-0"
                        style={{
                          color: "rgba(116, 135, 107, 0.9)",
                          background: "rgba(255, 255, 255, 0.8)",
                          border: "1px solid rgba(216, 210, 200, 0.5)",
                        }}
                      >
                        {stop.kind.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>

                  {stop.description && (
                    <p className="text-xs leading-relaxed text-brand-text-secondary mb-3">
                      {stop.description}
                    </p>
                  )}

                  {/* Time Blocks */}
                  {(morning || afternoon || evening) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 pt-3 border-t border-brand-border/30">
                      {morning && (
                        <div>
                          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-brand-text-secondary/70">Morning</span>
                          <p className="text-xs leading-relaxed text-brand-text-primary/90 mt-0.5">{morning}</p>
                        </div>
                      )}
                      {afternoon && (
                        <div>
                          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-brand-text-secondary/70">Afternoon</span>
                          <p className="text-xs leading-relaxed text-brand-text-primary/90 mt-0.5">{afternoon}</p>
                        </div>
                      )}
                      {evening && (
                        <div>
                          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-brand-text-secondary/70">Evening</span>
                          <p className="text-xs leading-relaxed text-brand-text-primary/90 mt-0.5">{evening}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hidden gems or local tips */}
                  {(hiddenGems || localTips || logistics) && (
                    <div className="flex flex-wrap gap-2 mt-3 pt-2 text-[0.72rem] text-brand-text-secondary">
                      {hiddenGems && (
                        <span className="bg-brand-bg/60 border border-brand-border/40 px-2.5 py-1 rounded-lg">
                          💎 <strong>Hidden Gem:</strong> {hiddenGems}
                        </span>
                      )}
                      {localTips && (
                        <span className="bg-brand-bg/60 border border-brand-border/40 px-2.5 py-1 rounded-lg">
                          💡 <strong>Tip:</strong> {localTips}
                        </span>
                      )}
                      {logistics?.estimatedCost && (
                        <span className="bg-brand-bg/60 border border-brand-border/40 px-2.5 py-1 rounded-lg">
                          🏷️ <strong>Est. Cost:</strong> {logistics.estimatedCost}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Highlights */}
                  {stop.highlights && stop.highlights.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {stop.highlights.map((h: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-brand-text-secondary">
                          <span className="w-1 h-1 rounded-full bg-brand-btn-primary/60 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface JourneyBeingCraftedProps {
  days: any[];
  expectedDurationDays?: number;
}

export function JourneyBeingCrafted({ days, expectedDurationDays = 7 }: JourneyBeingCraftedProps) {
  const skeletonCount = Math.max(0, expectedDurationDays - days.length);

  return (
    <div className="w-full flex flex-col">
      {/* Section label */}
      {(days.length > 0 || skeletonCount > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 mb-5"
        >
          <span
            className="text-[0.62rem] font-semibold uppercase tracking-[0.28em]"
            style={{ color: "rgba(168, 166, 157, 0.8)" }}
          >
            {days.length > 0
              ? `${days.length} of ${expectedDurationDays} days planned`
              : "Preparing your itinerary…"}
          </span>
          <div
            className="flex-1 h-px"
            style={{ background: "rgba(216, 210, 200, 0.5)" }}
          />
        </motion.div>
      )}

      <div className="space-y-4 w-full">
        <AnimatePresence>
          {days.map((day, index) => (
            <LiveDayCard key={`day-${index}`} day={day} order={index + 1} />
          ))}
          {skeletonCount > 0 && (
            <SkeletonDayCard key={`skeleton-${days.length}`} index={0} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
