"use client";

import { motion } from "motion/react";
import { ResilientImage } from "./ResilientImage";
import type { ShowcaseDestination } from "./types";

interface DestinationSelectorProps {
  destinations: ShowcaseDestination[];
  activeIndex: number;
  /** 0→1 progress of the active item toward auto-advance. */
  progress: number;
  onSelect: (index: number) => void;
}

/**
 * Compact thumbnail rail for choosing / previewing destinations. The active
 * thumbnail carries a thin progress bar that fills as the auto-rotation
 * approaches the next destination. Lays out as an even grid so it never
 * overflows or introduces horizontal scrolling on mobile.
 */
export function DestinationSelector({
  destinations,
  activeIndex,
  progress,
  onSelect,
}: DestinationSelectorProps) {
  return (
    <ul
      className="grid grid-cols-4 gap-2.5 sm:gap-3.5"
      aria-label="Choose a destination"
    >
      {destinations.map((destination, index) => {
        const isActive = index === activeIndex;
        const shortName = destination.shortName || destination.name.split(" ")[0];
        
        // Extract country from region (e.g. "Kyoto, Japan" -> "Japan")
        const regionParts = destination.region.split(",");
        const country = regionParts[regionParts.length - 1]?.trim() || "";

        return (
          <li key={destination.id}>
            <button
              type="button"
              onClick={() => onSelect(index)}
              aria-pressed={isActive}
              aria-label={`Feature ${destination.name}`}
              className={`group relative block aspect-[3/2] w-full overflow-hidden rounded-2xl border transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun-300 bg-[rgba(51,51,47,0.78)] ${
                isActive
                  ? "border-sun-400 ring-1 ring-sun-400/50 shadow-[0_4px_20px_rgba(212,163,89,0.2)] scale-[1.02]"
                  : "border-[rgba(244,239,230,0.15)] hover:border-[rgba(244,239,230,0.30)] hover:scale-[1.01]"
              }`}
            >
              <ResilientImage
                src={destination.image}
                alt=""
                fill
                priority={index === 0}
                sizes="(max-width: 640px) 22vw, 12vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"
              />
              
              <div className="absolute inset-x-2.5 bottom-2.5 sm:bottom-3 sm:inset-x-3 flex flex-col text-left">
                <span className="text-[0.5rem] sm:text-[0.55rem] font-bold uppercase tracking-[0.14em] text-[#E5B869] leading-none">
                  {country}
                </span>
                <span className="mt-0.5 sm:mt-1 text-[0.68rem] sm:text-xs font-semibold text-[#F4EFE6] tracking-wide leading-tight line-clamp-1">
                  {shortName}
                </span>
              </div>

              {/* Progress bar — active only */}
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[3px] bg-[rgba(244,239,230,0.15)]"
              >
                {isActive && (
                  <motion.span
                    className="block h-full origin-left bg-sun-400"
                    style={{ scaleX: progress }}
                  />
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
