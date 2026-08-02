"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  MapPin,
  Leaf,
  Clock,
  CalendarDays,
  Compass,
  CircleCheck,
  Check,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type SetupStageId =
  | "destination"
  | "journey-feel"
  | "journey-length"
  | "travel-dates"
  | "travel-style"
  | "review";

export const SETUP_STAGES: {
  id: SetupStageId;
  label: string;
  Icon: LucideIcon;
}[] = [
  { id: "destination", label: "Destination", Icon: MapPin },
  { id: "journey-feel", label: "Journey Feel", Icon: Leaf },
  { id: "journey-length", label: "Journey Length", Icon: Clock },
  { id: "travel-dates", label: "Travel Dates", Icon: CalendarDays },
  { id: "travel-style", label: "Travel Style", Icon: Compass },
  { id: "review", label: "Review", Icon: CircleCheck },
];

/** Matches MobileHeader sticky height (py-3 + row content). */
const MOBILE_HEADER_OFFSET_PX = 56;

interface JourneyRibbonProps {
  activeId: SetupStageId;
  completed: Record<SetupStageId, boolean>;
  /** stickyTop + ribbonHeight + padding — used as section scroll-margin-top. */
  onScrollMarginChange?: (px: number) => void;
}

export function JourneyRibbon({
  activeId,
  completed,
  onScrollMarginChange,
}: JourneyRibbonProps) {
  const navRef = useRef<HTMLElement>(null);

  const [checkVisible, setCheckVisible] = useState<Set<SetupStageId>>(
    () => new Set(SETUP_STAGES.filter((s) => completed[s.id]).map((s) => s.id)),
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
    for (const stage of SETUP_STAGES) {
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
  }, [completed]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !onScrollMarginChange) return;

    const publish = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      const stickyTop = isDesktop ? 0 : MOBILE_HEADER_OFFSET_PX;
      const height = Math.ceil(nav.getBoundingClientRect().height);
      onScrollMarginChange(stickyTop + height + 16);
    };

    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(nav);
    window.addEventListener("resize", publish);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", publish);
    };
  }, [onScrollMarginChange]);

  const scrollTo = (id: SetupStageId) => {
    const el = document.getElementById(`setup-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav
      ref={navRef}
      aria-label="Journey setup progress"
      className={[
        "sticky z-20 top-14 lg:top-0",
        "border-b border-brand-border/25",
        "bg-brand-bg/95 backdrop-blur-md",
        "shadow-[0_1px_0_0_rgba(51,51,47,0.04)]",
      ].join(" ")}
    >
      <ol
        className={[
          "flex w-full items-center",
          // Mobile: scrollable row with comfortable gaps
          "gap-3 overflow-x-auto py-3.5",
          "scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // md+: single row, no wrap — connectors (flex-1) space stages evenly
          "md:gap-0 md:overflow-visible",
        ].join(" ")}
      >
        {SETUP_STAGES.map((stage, index) => {
          const isLast = index === SETUP_STAGES.length - 1;
          const isDone = completed[stage.id];
          const isCurrent = activeId === stage.id;
          const showCheck = isDone && checkVisible.has(stage.id);

          return (
            <Fragment key={stage.id}>
              <li className="shrink-0">
                <button
                  type="button"
                  onClick={() => scrollTo(stage.id)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${stage.label}, ${isDone ? "completed" : isCurrent ? "current" : "upcoming"}`}
                  className={[
                    "flex min-h-[44px] items-center gap-2.5 rounded-full px-2.5 py-1.5 sm:px-3",
                    "transition-colors duration-300 ease-out",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary",
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
