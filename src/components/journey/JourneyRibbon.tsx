"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  MapPin,
  SlidersHorizontal,
  CalendarDays,
  CircleCheck,
  Check,
  Mountain,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SetupStageId =
  | "destination"
  | "journey-feel"
  | "along-the-way"
  | "when"
  | "review";

export const SETUP_STAGES: {
  id: SetupStageId;
  label: string;
  Icon: LucideIcon;
}[] = [
  { id: "destination", label: "Destination", Icon: MapPin },
  { id: "journey-feel", label: "Journey Feel", Icon: SlidersHorizontal },
  { id: "along-the-way", label: "Along the Way", Icon: Mountain },
  { id: "when", label: "When", Icon: CalendarDays },
  { id: "review", label: "Review", Icon: CircleCheck },
];

/** Shorter path for Explore-a-Place intent. */
export const EXPLORE_STAGES: typeof SETUP_STAGES = [
  { id: "destination", label: "Destination", Icon: MapPin },
  { id: "journey-feel", label: "Journey Feel", Icon: SlidersHorizontal },
  { id: "along-the-way", label: "Along the Way", Icon: Mountain },
  { id: "review", label: "Review", Icon: CircleCheck },
];

interface JourneyRibbonProps {
  activeId: SetupStageId;
  completed: Record<SetupStageId, boolean>;
  /** Furthest stage the traveller may open (current + completed). */
  reachableIds: SetupStageId[];
  onSelect: (id: SetupStageId) => void;
  stages?: typeof SETUP_STAGES;
}

export function JourneyRibbon({
  activeId,
  completed,
  reachableIds,
  onSelect,
  stages = SETUP_STAGES,
}: JourneyRibbonProps) {
  const reachable = new Set(reachableIds);
  const [checkVisible, setCheckVisible] = useState<Set<SetupStageId>>(
    () => new Set(stages.filter((s) => completed[s.id]).map((s) => s.id)),
  );
  const prevCompleted = useRef(completed);
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      prevCompleted.current = completed;
      return;
    }

    const fresh: SetupStageId[] = [];
    for (const stage of stages) {
      if (completed[stage.id] && !prevCompleted.current[stage.id]) {
        fresh.push(stage.id);
      }
      if (!completed[stage.id] && prevCompleted.current[stage.id]) {
        setCheckVisible((prev) => {
          const next = new Set(prev);
          next.delete(stage.id);
          return next;
        });
      }
    }
    prevCompleted.current = completed;

    if (fresh.length === 0) return;

    const frame = requestAnimationFrame(() => {
      setCheckVisible((prev) => {
        const next = new Set(prev);
        for (const id of fresh) next.add(id);
        return next;
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [completed, stages]);

  return (
    <nav aria-label="Journey setup progress" className="pb-1">
      <ol
        className={[
          "flex w-full items-center",
          "gap-1 overflow-x-auto py-2",
          "scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "md:gap-0 md:overflow-visible",
        ].join(" ")}
      >
        {stages.map((stage, index) => {
          const isLast = index === stages.length - 1;
          const isDone = completed[stage.id];
          const isCurrent = activeId === stage.id;
          const canOpen = reachable.has(stage.id);
          const showCheck = isDone && checkVisible.has(stage.id);
          const connectorDone = isDone || isCurrent;

          return (
            <Fragment key={stage.id}>
              <li className="shrink-0">
                <button
                  type="button"
                  onClick={() => canOpen && onSelect(stage.id)}
                  disabled={!canOpen}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${stage.label}, ${isDone ? "completed" : isCurrent ? "current" : "upcoming"}`}
                  className={[
                    "flex min-h-[44px] items-center gap-2.5 rounded-full px-1.5 py-1.5 sm:gap-3 sm:px-2",
                    "transition-[opacity,colors] duration-300 ease-out",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
                    canOpen ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-[border-color,background-color,color,box-shadow] duration-500 ease-out",
                      isCurrent
                        ? "border-brand-btn-primary bg-brand-btn-primary text-white shadow-[0_1px_3px_rgba(116,135,107,0.35)]"
                        : isDone
                          ? "border-brand-btn-primary bg-brand-btn-primary/25 text-brand-btn-primary-hover"
                          : "border-brand-btn-primary/65 bg-white text-brand-btn-primary-hover",
                    ].join(" ")}
                  >
                    {isDone && !isCurrent ? (
                      <Check
                        className={[
                          "h-3.5 w-3.5 transition-opacity duration-500 ease-out",
                          showCheck ? "opacity-100" : "opacity-0",
                        ].join(" ")}
                        strokeWidth={2.4}
                        aria-hidden
                      />
                    ) : (
                      <stage.Icon
                        className="h-3.5 w-3.5"
                        strokeWidth={isCurrent ? 2.15 : 2}
                        aria-hidden
                      />
                    )}
                  </span>

                  <span
                    className={[
                      "whitespace-nowrap text-[0.7rem] tracking-wide md:text-[0.75rem]",
                      "transition-colors duration-300 ease-out",
                      isCurrent
                        ? "font-semibold text-brand-text-primary"
                        : isDone
                          ? "font-medium text-brand-btn-primary-hover"
                          : "font-medium text-brand-text-secondary",
                    ].join(" ")}
                  >
                    {stage.label}
                  </span>
                </button>
              </li>

              {!isLast && (
                <li
                  aria-hidden
                  className="mx-1.5 hidden min-w-[1.75rem] flex-1 items-center md:flex"
                >
                  <span
                    className={[
                      "h-0 w-full border-t-2 border-dotted transition-colors duration-500 ease-out",
                      connectorDone
                        ? "border-brand-btn-primary"
                        : "border-brand-btn-primary/55",
                    ].join(" ")}
                  />
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
