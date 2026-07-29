"use client";

import { motion, AnimatePresence } from "motion/react";
import { SkeletonDayCard } from "./generation/SkeletonDayCard";

interface LiveDayCardProps {
  stop: any;
  order: number;
}

function LiveDayCard({ stop, order }: LiveDayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.92)",
        border: "1px solid rgba(216, 210, 200, 0.6)",
        boxShadow: "0 8px 40px -16px rgba(51, 51, 47, 0.12)",
      }}
    >
      {/* Accent line */}
      <div
        className="absolute top-0 left-0 w-[3px] h-full rounded-l-2xl"
        style={{ background: "rgba(116, 135, 107, 0.7)" }}
      />

      <div className="px-6 py-6 pl-8">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] px-2 py-0.5 rounded-full"
                style={{
                  color: "rgba(116, 135, 107, 0.9)",
                  background: "rgba(116, 135, 107, 0.1)",
                  border: "1px solid rgba(116, 135, 107, 0.2)",
                }}
              >
                Day {order}
              </span>
              {stop.kind && (
                <span
                  className="text-[0.62rem] font-medium uppercase tracking-[0.2em] px-2 py-0.5 rounded-full"
                  style={{
                    color: "rgba(168, 166, 157, 0.9)",
                    background: "rgba(244, 239, 230, 0.8)",
                    border: "1px solid rgba(216, 210, 200, 0.5)",
                  }}
                >
                  {stop.kind}
                </span>
              )}
            </div>
            <h4
              className="font-display text-xl font-light leading-tight tracking-[-0.01em]"
              style={{ color: "rgba(51, 51, 47, 1)" }}
            >
              {stop.name || "Unknown stop"}
            </h4>
            <p
              className="text-sm mt-0.5"
              style={{ color: "rgba(168, 166, 157, 0.9)" }}
            >
              {stop.nights ? `${stop.nights} night${stop.nights > 1 ? "s" : ""}` : "Day visit"}
            </p>
          </div>
        </div>

        {/* Description */}
        {(stop.description || stop.summary) && (
          <p
            className="text-sm leading-relaxed mb-5"
            style={{ color: "rgba(80, 79, 74, 0.85)" }}
          >
            {stop.description || stop.summary}
          </p>
        )}

        {/* Highlights */}
        {stop.highlights && stop.highlights.length > 0 && (
          <div>
            <p
              className="text-[0.62rem] font-semibold uppercase tracking-[0.25em] mb-2.5"
              style={{ color: "rgba(168, 166, 157, 0.8)" }}
            >
              Highlights
            </p>
            <ul className="space-y-1.5">
              {stop.highlights.map((h: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(80, 79, 74, 0.85)" }}>
                  <span
                    className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ background: "rgba(116, 135, 107, 0.6)" }}
                  />
                  {h}
                </li>
              ))}
            </ul>
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
            <LiveDayCard key={`day-${index}`} stop={day} order={index + 1} />
          ))}
          {skeletonCount > 0 && (
            <SkeletonDayCard key={`skeleton-${days.length}`} index={0} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
