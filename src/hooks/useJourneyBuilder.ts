"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { updateDraft } from "@/actions/journey-actions";
import type { Journey } from "@prisma/client";
import {
  parseBuilderMeta,
  type TripShape,
  EMPTY_TRIP_SHAPE,
} from "@/lib/journey/trip-shape";

export interface JourneyData {
  title: string;
  originQuery: string | null;
  primaryCountry: string | null;
  region: string | null;
  startDate: Date | null;
  endDate: Date | null;
  durationDays: number | null;
  pace: "ONE_PLACE_DEEPLY" | "SLOW_UNHURRIED" | "GENTLY_BALANCED" | null;
  budget: "MODEST" | "COMFORTABLE" | "PREMIUM" | "LUXURY" | null;
  feelings: string[];
  tripShape: TripShape;
  intent: "journey" | "explore";
}

type SavePayload = Partial<JourneyData> & { lastCompletedStep?: number };

export function useJourneyBuilder(draft: Journey) {
  const meta = parseBuilderMeta(draft.metadata);

  const [data, setData] = useState<JourneyData>({
    title: draft.title || "Untitled Journey",
    originQuery: draft.originQuery || null,
    primaryCountry: draft.primaryCountry || null,
    region: draft.region || null,
    startDate: draft.startDate ? new Date(draft.startDate) : null,
    endDate: draft.endDate ? new Date(draft.endDate) : null,
    durationDays: draft.durationDays || null,
    pace: draft.pace || null,
    budget: draft.budget || null,
    feelings: meta.feelings,
    tripShape: meta.tripShape.mustVisit
      ? meta.tripShape
      : { ...EMPTY_TRIP_SHAPE, ...meta.tripShape },
    intent: meta.intent,
  });

  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<SavePayload>({});
  // Saves run one at a time so a slow earlier write can never land after —
  // and overwrite — a newer one.
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());

  const saveToDb = useCallback(() => {
    saveChainRef.current = saveChainRef.current.then(async () => {
      const payload = { ...pendingDataRef.current };
      const keys = Object.keys(payload) as (keyof SavePayload)[];
      if (keys.length === 0) return;

      setIsSaving(true);
      try {
        const {
          feelings,
          tripShape,
          intent,
          lastCompletedStep,
          ...columns
        } = payload;
        await updateDraft(draft.id, {
          ...columns,
          ...(feelings !== undefined ? { feelings } : {}),
          ...(tripShape !== undefined ? { tripShape } : {}),
          ...(intent !== undefined ? { intent } : {}),
          ...(lastCompletedStep !== undefined ? { lastCompletedStep } : {}),
        });
        // Retire only the values this request actually carried. Anything the
        // traveller changed while it was in flight stays queued instead of
        // being silently dropped.
        const pending = pendingDataRef.current as Record<string, unknown>;
        for (const key of keys) {
          if (pending[key] === (payload as Record<string, unknown>)[key]) {
            delete pending[key];
          }
        }
      } catch (error) {
        console.error("Failed to save draft:", error);
      } finally {
        setIsSaving(false);
      }
    });

    return saveChainRef.current;
  }, [draft.id]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (Object.keys(pendingDataRef.current).length > 0) {
        const {
          feelings,
          tripShape,
          intent,
          lastCompletedStep,
          ...columns
        } = pendingDataRef.current;
        void updateDraft(draft.id, {
          ...columns,
          ...(feelings !== undefined ? { feelings } : {}),
          ...(tripShape !== undefined ? { tripShape } : {}),
          ...(intent !== undefined ? { intent } : {}),
          ...(lastCompletedStep !== undefined ? { lastCompletedStep } : {}),
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.id]);

  const queueSave = useCallback(
    (payload: SavePayload, immediate = false) => {
      pendingDataRef.current = { ...pendingDataRef.current, ...payload };

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (immediate) {
        return saveToDb();
      }

      debounceRef.current = setTimeout(() => {
        void saveToDb();
      }, 1000);
      return Promise.resolve();
    },
    [saveToDb],
  );

  const update = useCallback(
    <K extends keyof JourneyData>(key: K, value: JourneyData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
      queueSave({ [key]: value } as SavePayload);
    },
    [queueSave],
  );

  /** Awaitable so callers can persist before navigating away. */
  const flushSave = useCallback(() => {
    if (Object.keys(pendingDataRef.current).length === 0) {
      return saveChainRef.current;
    }
    return queueSave({}, true);
  }, [queueSave]);

  return {
    data,
    isSaving,
    update,
    flushSave,
  };
}
