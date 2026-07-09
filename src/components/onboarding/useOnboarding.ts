"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { STEPS } from "./onboarding.config";

export interface OnboardingData {
  name: string;
  email: string;
  /** single travel style id */
  style: string | null;
  /** multiple interest ids */
  interests: string[];
  /** single pace id */
  pace: string | null;
  /** multiple preference ids */
  preferences: string[];
}

const INITIAL: OnboardingData = {
  name: "",
  email: "",
  style: null,
  interests: [],
  pace: null,
  preferences: [],
};

export interface UseOnboarding {
  step: number;
  totalSteps: number;
  data: OnboardingData;
  isFirst: boolean;
  isLast: boolean;
  /** Whether the current step's requirements are met (enables "Continue"). */
  canAdvance: boolean;
  saving: boolean;
  saveError?: string;
  next: () => void;
  back: () => void;
  goTo: (index: number) => void;
  update: <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => void;
  toggleInArray: (key: "interests" | "preferences", id: string) => void;
  complete: () => Promise<boolean>;
}

/**
 * Owns all onboarding answers and navigation. Answers are restored from and
 * saved to the onboarding API so an authenticated traveller can resume later.
 */
export function useOnboarding(): UseOnboarding {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const totalSteps = STEPS.length;

  useEffect(() => {
    let active = true;

    async function loadSaved() {
      try {
        const res = await fetch("/api/v1/onboarding", { cache: "no-store" });
        if (!res.ok) return;
        const saved = (await res.json()) as {
          data?: OnboardingData;
          step?: number;
          onboardingComplete?: boolean;
        };
        if (!active || !saved.data) return;
        setData(saved.data);
        setStep(
          saved.onboardingComplete
            ? totalSteps - 1
            : Math.max(0, Math.min(saved.step ?? 0, totalSteps - 1)),
        );
      } catch {
        // Onboarding still works locally if resume data cannot be loaded.
      }
    }

    void loadSaved();
    return () => {
      active = false;
    };
  }, [totalSteps]);

  const update = useCallback(
    <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
      setData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleInArray = useCallback(
    (key: "interests" | "preferences", id: string) => {
      setData((prev) => {
        const list = prev[key];
        return {
          ...prev,
          [key]: list.includes(id)
            ? list.filter((x) => x !== id)
            : [...list, id],
        };
      });
    },
    [],
  );

  const persist = useCallback(
    async (nextStep: number) => {
      try {
        await fetch("/api/v1/onboarding", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ step: nextStep, data }),
        });
      } catch {
        // Partial-save failure should not block the local step flow.
      }
    },
    [data],
  );

  const next = useCallback(() => {
    setStep((current) => {
      const nextStep = Math.min(current + 1, totalSteps - 1);
      void persist(nextStep);
      return nextStep;
    });
  }, [persist, totalSteps]);
  const back = useCallback(() => setStep((s) => Math.max(s - 1, 0)), []);
  const goTo = useCallback(
    (index: number) => setStep(Math.max(0, Math.min(index, totalSteps - 1))),
    [totalSteps],
  );

  const complete = useCallback(async () => {
    setSaving(true);
    setSaveError(undefined);
    try {
      const res = await fetch("/api/v1/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: totalSteps - 1, data }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const friendlyMessage = body?.error || "We couldn't save your profile. Try again.";
        setSaveError(friendlyMessage);
        toast.error(friendlyMessage);
        return false;
      }
      return true;
    } catch {
      const friendlyMessage = "Network error. Please try again.";
      setSaveError(friendlyMessage);
      toast.error(friendlyMessage);
      return false;
    } finally {
      setSaving(false);
    }
  }, [data, totalSteps]);

  const canAdvance = useMemo(() => {
    switch (step) {
      case 0:
        return data.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
      case 1:
        return data.style !== null;
      case 2:
        return data.interests.length >= 1;
      case 3:
        return data.pace !== null;
      case 4:
        return data.preferences.length >= 1;
      default:
        return true;
    }
  }, [step, data]);

  return {
    step,
    totalSteps,
    data,
    isFirst: step === 0,
    isLast: step === totalSteps - 1,
    canAdvance,
    saving,
    saveError,
    next,
    back,
    goTo,
    update,
    toggleInArray,
    complete,
  };
}
