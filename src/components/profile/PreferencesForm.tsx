"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { buttonStyles } from "@/lib/design";
import {
  TRAVEL_STYLES,
  INTERESTS,
  PACES,
  PREFERENCES,
} from "@/components/onboarding/onboarding.config";
import type { OnboardingData } from "@/components/onboarding/useOnboarding";

export function PreferencesForm() {
  const [data, setData] = useState<OnboardingData>({
    style: null,
    interests: [],
    pace: null,
    preferences: [],
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await fetch("/api/v1/onboarding", { cache: "no-store" });
        if (res.ok) {
          const body = await res.json();
          if (body.data) {
            setData(body.data);
          }
        }
      } catch (error) {
        // Fallback to initial empty state
      } finally {
        setLoading(false);
      }
    }
    void loadPreferences();
  }, []);

  const handleStyleSelect = (id: string) => {
    setData((prev) => ({ ...prev, style: id }));
  };

  const handlePaceSelect = (id: string) => {
    setData((prev) => ({ ...prev, pace: id }));
  };

  const toggleInterest = (id: string) => {
    setData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
  };

  const togglePreference = (id: string) => {
    setData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(id)
        ? prev.preferences.filter((p) => p !== id)
        : [...prev.preferences, id],
    }));
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (!data.style) {
      toast.error("Please select a travel style.");
      return;
    }
    if (!data.pace) {
      toast.error("Please select your natural pace.");
      return;
    }
    if (data.interests.length === 0) {
      toast.error("Please select at least one interest.");
      return;
    }
    if (data.preferences.length === 0) {
      toast.error("Please select at least one preference.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/v1/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 4, data }),
      });

      if (res.ok) {
        toast.success("Travel preferences updated successfully.");
      } else {
        const body = await res.json().catch(() => null);
        toast.error(body?.error?.message || "Failed to save travel preferences.");
      }
    } catch (e) {
      toast.error("Network error while saving preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-border border-t-brand-btn-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* 1. Travel Style */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-brand-text-primary">Travel Style</h3>
          <p className="text-xs text-brand-text-secondary">
            Select the overarching rhythm of your journeys.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRAVEL_STYLES.map((style) => {
            const isSelected = data.style === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => handleStyleSelect(style.id)}
                className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-[#74876B] bg-[#74876B]/10 ring-1 ring-[#74876B]"
                    : "border-brand-border bg-brand-card hover:border-brand-text-secondary/50 hover:bg-brand-text-primary/3"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl" aria-hidden>{style.glyph}</span>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#74876B] text-white">
                      <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden>
                        <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-brand-text-primary">{style.label}</p>
                  <p className="mt-1 text-xs text-brand-text-secondary line-clamp-2">{style.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Pace */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-brand-text-primary">Natural Pace</h3>
          <p className="text-xs text-brand-text-secondary">
            How fast or slow you prefer your itineraries to unfold.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PACES.map((pace) => {
            const isSelected = data.pace === pace.id;
            return (
              <button
                key={pace.id}
                type="button"
                onClick={() => handlePaceSelect(pace.id)}
                className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-[#74876B] bg-[#74876B]/10 ring-1 ring-[#74876B]"
                    : "border-brand-border bg-brand-card hover:border-brand-text-secondary/50 hover:bg-brand-text-primary/3"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl" aria-hidden>{pace.glyph}</span>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#74876B] text-white">
                      <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden>
                        <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-brand-text-primary">{pace.label}</p>
                  <p className="mt-1 text-xs text-brand-text-secondary line-clamp-2">{pace.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Interests */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-brand-text-primary">Interests</h3>
          <p className="text-xs text-brand-text-secondary">
            Select the themes and activities you love to experience.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {INTERESTS.map((interest) => {
            const isSelected = data.interests.includes(interest.id);
            return (
              <button
                key={interest.id}
                type="button"
                onClick={() => toggleInterest(interest.id)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? "border-[#74876B] bg-[#74876B] text-white shadow-xs"
                    : "border-brand-border bg-brand-card text-brand-text-primary hover:border-brand-text-secondary hover:bg-brand-text-primary/5"
                }`}
              >
                <span aria-hidden>{interest.glyph}</span>
                <span>{interest.label}</span>
                {isSelected && (
                  <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 ml-0.5" aria-hidden>
                    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Preferences */}
      <div>
        <div className="mb-4">
          <h3 className="text-base font-semibold text-brand-text-primary">Travel Preferences</h3>
          <p className="text-xs text-brand-text-secondary">
            Specific details to honor while crafting your trips.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {PREFERENCES.map((pref) => {
            const isSelected = data.preferences.includes(pref.id);
            return (
              <button
                key={pref.id}
                type="button"
                onClick={() => togglePreference(pref.id)}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? "border-[#74876B] bg-[#74876B] text-white shadow-xs"
                    : "border-brand-border bg-brand-card text-brand-text-primary hover:border-brand-text-secondary hover:bg-brand-text-primary/5"
                }`}
              >
                <span aria-hidden>{pref.glyph}</span>
                <span>{pref.label}</span>
                {isSelected && (
                  <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 ml-0.5" aria-hidden>
                    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="border-t border-brand-border pt-6 text-right">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={`${buttonStyles.primary}`}
        >
          {isSaving ? "Saving Preferences…" : "Update Travel Preferences"}
        </button>
      </div>
    </div>
  );
}
