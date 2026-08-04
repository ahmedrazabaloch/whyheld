"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  MapPin,
  Leaf,
  CalendarDays,
  CircleCheck,
  Check,
  Route,
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
  { id: "journey-feel", label: "Journey Feel", Icon: Leaf },
  { id: "along-the-way", label: "Along the Way", Icon: Route },
  { id: "when", label: "When", Icon: CalendarDays },
  { id: "review", label: "Review", Icon: CircleCheck },
];

/** Shorter path for Explore-a-Place intent. */
export const EXPLORE_STAGES: typeof SETUP_STAGES = [
  { id: "destination", label: "Destination", Icon: MapPin },
  { id: "journey-feel", label: "Journey Feel", Icon: Leaf },
  { id: "along-the-way", label: "Along the Way", Icon: Route },
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
    <nav
      aria-label="Journey setup progress"
      className="border-b border-brand-border/25 pb-1"
    >
      <ol
        className={[
          "flex w-full items-center",
          "gap-2 overflow-x-auto py-2",
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
                    "flex min-h-[44px] items-center gap-2 rounded-full px-2 py-1.5 sm:gap-2.5 sm:px-2.5",
                    "transition-colors duration-300 ease-out",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
                    canOpen ? "cursor-pointer" : "cursor-not-allowed opacity-45",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-[border-color,background-color,color] duration-500 ease-out",
                      isDone
                        ? "border-brand-btn-primary/50 bg-brand-btn-primary/15 text-brand-btn-primary"
                        : isCurrent
                          ? "border-brand-btn-primary bg-brand-btn-primary/10 text-brand-btn-primary"
                          : "border-brand-border/80 bg-transparent text-brand-text-secondary/50",
                    ].join(" ")}
                  >
                    {isDone ? (
                      <Check
                        className={[
                          "h-3 w-3 transition-opacity duration-500 ease-out",
                          showCheck ? "opacity-100" : "opacity-0",
                        ].join(" ")}
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    ) : (
                      <stage.Icon
                        className="h-3 w-3"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    )}
                  </span>

                  <span
                    className={[
                      "whitespace-nowrap text-[0.6875rem] tracking-wide md:text-[0.7rem]",
                      "transition-colors duration-300 ease-out",
                      isCurrent
                        ? "font-medium text-brand-text-primary"
                        : isDone
                          ? "text-brand-text-primary/75"
                          : "text-brand-text-secondary/50",
                    ].join(" ")}
                  >
                    {stage.label}
                  </span>
                </button>
              </li>

              {!isLast && (
                <li
                  aria-hidden
                  className={[
                    "hidden h-px min-w-[1.25rem] flex-1 md:block",
                    "transition-colors duration-500 ease-out",
                    isDone
                      ? "bg-brand-btn-primary/40"
                      : "bg-brand-border/60",
                  ].join(" ")}
                />
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
