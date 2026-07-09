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
  const meta = draft.metadata as { lastCompletedStep?: number } | null;
  const initialStep = meta?.lastCompletedStep ?? 0;

  const [step, setStep] = useState(initialStep);
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

  const next = () => {
    setStep((s) => {
      const nextStep = s + 1;
      queueSave({ lastCompletedStep: nextStep }, true);
      return nextStep;
    });
  };

  const back = () => {
    setStep((s) => {
      const prevStep = Math.max(0, s - 1);
      queueSave({ lastCompletedStep: prevStep }, true);
      return prevStep;
    });
  };

  const goTo = (s: number) => {
    setStep(s);
    queueSave({ lastCompletedStep: s }, true);
  };

  return {
    step,
    data,
    isSaving,
    update,
    next,
    back,
    goTo,
    flushSave,
  };
}
