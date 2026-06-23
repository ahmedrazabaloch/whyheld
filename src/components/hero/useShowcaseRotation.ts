"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseShowcaseRotationOptions {
  /** Number of items in the showcase. */
  count: number;
  /** Interval between automatic advances (ms). */
  interval: number;
  /** When true, rotation is disabled entirely. */
  paused?: boolean;
}

interface UseShowcaseRotation {
  /** Currently featured index. */
  index: number;
  /** Jump to a specific index (resets the timer). */
  setIndex: (next: number) => void;
  /** Advance to the next index (resets the timer). */
  next: () => void;
  /** 0 → 1 progress toward the next auto-advance, for a progress ring. */
  progress: number;
}

/**
 * Drives the auto-rotating showcase. Advances on an interval, exposes a
 * smooth 0→1 progress value for the active thumbnail ring, and lets callers
 * jump/skip manually (which restarts the cycle cleanly).
 */
export function useShowcaseRotation({
  count,
  interval,
  paused = false,
}: UseShowcaseRotationOptions): UseShowcaseRotation {
  const [index, setIndexState] = useState(0);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const resetFrameRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    startRef.current = performance.now();
    setProgress(0);
  }, []);

  const setIndex = useCallback(
    (next: number) => {
      setIndexState(((next % count) + count) % count);
      resetTimer();
    },
    [count, resetTimer],
  );

  const next = useCallback(() => {
    setIndexState((prev) => (prev + 1) % count);
    resetTimer();
  }, [count, resetTimer]);

  useEffect(() => {
    if (paused) return;

    startRef.current = performance.now();
    resetFrameRef.current = requestAnimationFrame(() => setProgress(0));

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const ratio = Math.min(elapsed / interval, 1);
      setProgress(ratio);

      if (ratio >= 1) {
        setIndexState((prev) => (prev + 1) % count);
        startRef.current = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (resetFrameRef.current !== null) cancelAnimationFrame(resetFrameRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [count, interval, paused]);

  return { index, setIndex, next, progress };
}
