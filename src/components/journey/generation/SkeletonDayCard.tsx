"use client";

import { motion } from "motion/react";

interface SkeletonDayCardProps {
  index: number;
}

export function SkeletonDayCard({ index }: SkeletonDayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: index * 0.09,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: "rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(216, 210, 200, 0.5)",
        boxShadow: "0 8px 32px -12px rgba(51, 51, 47, 0.08)",
      }}
      aria-busy="true"
      aria-label={`Loading day ${index + 1}`}
    >
      {/* Accent line left */}
      <div
        className="absolute top-0 left-0 w-[3px] h-full rounded-l-2xl"
        style={{ background: "rgba(216, 210, 200, 0.6)" }}
      />

      {/* Shimmer overlay */}
      <ShimmerOverlay />

      <div className="px-6 py-6 pl-8">
        {/* Day label */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="h-4 w-14 rounded-full"
            style={{ background: "rgba(216, 210, 200, 0.7)" }}
          />
          <div
            className="h-4 w-20 rounded-full"
            style={{ background: "rgba(216, 210, 200, 0.5)" }}
          />
        </div>

        {/* Title */}
        <div
          className="h-6 w-2/3 rounded-xl mb-2"
          style={{ background: "rgba(216, 210, 200, 0.65)" }}
        />
        <div
          className="h-5 w-1/3 rounded-xl mb-5"
          style={{ background: "rgba(216, 210, 200, 0.45)" }}
        />

        {/* Description lines */}
        <div className="space-y-2.5 mb-5">
          <div
            className="h-3 w-full rounded-full"
            style={{ background: "rgba(216, 210, 200, 0.5)" }}
          />
          <div
            className="h-3 w-5/6 rounded-full"
            style={{ background: "rgba(216, 210, 200, 0.4)" }}
          />
          <div
            className="h-3 w-4/6 rounded-full"
            style={{ background: "rgba(216, 210, 200, 0.3)" }}
          />
        </div>

        {/* Highlights */}
        <div className="space-y-2">
          <div
            className="h-3 w-16 rounded-full mb-3"
            style={{ background: "rgba(216, 210, 200, 0.45)" }}
          />
          {[1, 2, 3].map((j) => (
            <div key={j} className="flex items-center gap-2">
              <div
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: "rgba(216, 210, 200, 0.6)" }}
              />
              <div
                className="h-3 rounded-full"
                style={{
                  background: "rgba(216, 210, 200, 0.4)",
                  width: `${55 + j * 12}%`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/** Moving shimmer bar across the card surface */
function ShimmerOverlay() {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["-200% 0", "200% 0"] }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "linear",
          repeatDelay: 0.4,
        }}
      />
    </motion.div>
  );
}
