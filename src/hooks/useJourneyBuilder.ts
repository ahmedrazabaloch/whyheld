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

  const saveToDb = useCallback(
    async (payload: SavePayload) => {
      if (Object.keys(payload).length === 0) return;

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
        pendingDataRef.current = {};
      } catch (error) {
        console.error("Failed to save draft:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [draft.id],
  );

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
        saveToDb({ ...pendingDataRef.current });
      } else {
        debounceRef.current = setTimeout(() => {
          saveToDb({ ...pendingDataRef.current });
        }, 1000);
      }
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

  const flushSave = useCallback(() => {
    if (Object.keys(pendingDataRef.current).length > 0) {
      queueSave({}, true);
    }
  }, [queueSave]);

  return {
    data,
    isSaving,
    update,
    flushSave,
  };
}
