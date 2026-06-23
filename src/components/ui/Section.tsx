import type { ReactNode } from "react";
import { sectionContainer, sectionShell } from "@/lib/design";

/** Hairline gradient divider at the top edge of a section. */
export function SectionDivider() {
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-mist-50/15 to-transparent"
    />
  );
}

/** Cinematic film-grain overlay. `opacity` matches the per-section tuning. */
export function GrainOverlay({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="bg-grain pointer-events-none absolute inset-0 -z-10 mix-blend-soft-light"
      style={{ opacity }}
    />
  );
}

interface SectionProps {
  id?: string;
  /** id of the heading element for aria-labelledby */
  labelledBy?: string;
  /** Show the hairline top divider. */
  divider?: boolean;
  /** Show the grain overlay (and its opacity). */
  grain?: boolean | number;
  /** Ambient background layers (glows) rendered behind content. */
  background?: ReactNode;
  className?: string;
  /** Extra classes for the inner container. */
  containerClassName?: string;
  children: ReactNode;
}

/**
 * The shared landing-section shell. Guarantees consistent vertical rhythm,
 * container width/padding, divider, grain and ambient background slots — so
 * every section stays on-system and free of horizontal scroll.
 */
export function Section({
  id,
  labelledBy,
  divider = true,
  grain = 0.06,
  background,
  className,
  containerClassName,
  children,
}: SectionProps) {
  const grainOpacity = typeof grain === "number" ? grain : 0.06;

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${sectionShell}${className ? ` ${className}` : ""}`}
    >
      {background}
      {divider && <SectionDivider />}
      {grain !== false && <GrainOverlay opacity={grainOpacity} />}
      <div
        className={`${sectionContainer}${containerClassName ? ` ${containerClassName}` : ""}`}
      >
        {children}
      </div>
    </section>
  );
}
