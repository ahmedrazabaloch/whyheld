"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { updateDraft } from "@/actions/journey-actions";
import type { Journey } from "@prisma/client";

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
}

export function useJourneyBuilder(draft: Journey) {
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
  });

  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<Partial<JourneyData> & { lastCompletedStep?: number }>({});

  const saveToDb = useCallback(async (payload: Partial<JourneyData> & { lastCompletedStep?: number }) => {
    // Guard: skip the network hop entirely if there is nothing to persist.
    if (Object.keys(payload).length === 0) return;

    setIsSaving(true);
    try {
      await updateDraft(draft.id, payload);
      pendingDataRef.current = {};
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSaving(false);
    }
  }, [draft.id]);

  // Flush any pending debounced save when the component unmounts.
  // Prevents data loss if the user navigates away before the debounce fires.
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (Object.keys(pendingDataRef.current).length > 0) {
        // Fire-and-forget: best-effort flush on unmount.
        updateDraft(draft.id, { ...pendingDataRef.current });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.id]);

  const queueSave = useCallback((payload: Partial<JourneyData> & { lastCompletedStep?: number }, immediate = false) => {
    pendingDataRef.current = { ...pendingDataRef.current, ...payload };
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (immediate) {
      saveToDb({ ...pendingDataRef.current });
    } else {
      debounceRef.current = setTimeout(() => {
        saveToDb({ ...pendingDataRef.current });
      }, 1000);
    }
  }, [saveToDb]);

  const update = useCallback(<K extends keyof JourneyData>(key: K, value: JourneyData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
    queueSave({ [key]: value });
  }, [queueSave]);

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
