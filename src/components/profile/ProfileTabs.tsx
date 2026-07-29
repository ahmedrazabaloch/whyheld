"use client";

import { useState } from "react";
import { ProfileForm } from "./ProfileForm";
import { PreferencesForm } from "./PreferencesForm";
import { SecurityForm } from "./SecurityForm";
import { buttonStyles } from "@/lib/design";

interface ProfileTabsProps {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  initialLocation: string;
  onboardingComplete: boolean;
  fullName: string;
}

type TabType = "personal" | "preferences" | "security";

export function ProfileTabs({
  firstName,
  lastName,
  phone,
  email,
  initialLocation,
  onboardingComplete,
  fullName,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("personal");

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-24">
      {/* Navigation Tabs */}
      <div className="flex border-b border-brand-border/80 gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={`relative cursor-pointer px-4 py-3 text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
            activeTab === "personal"
              ? "text-[#74876B]"
              : "text-brand-text-secondary hover:text-brand-text-primary"
          }`}
        >
          Personal Details
          {activeTab === "personal" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#74876B]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("preferences")}
          className={`relative cursor-pointer px-4 py-3 text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
            activeTab === "preferences"
              ? "text-[#74876B]"
              : "text-brand-text-secondary hover:text-brand-text-primary"
          }`}
        >
          Travel Preferences
          {activeTab === "preferences" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#74876B]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`relative cursor-pointer px-4 py-3 text-sm font-semibold transition-colors duration-200 whitespace-nowrap ${
            activeTab === "security"
              ? "text-[#74876B]"
              : "text-brand-text-secondary hover:text-brand-text-primary"
          }`}
        >
          Security
          {activeTab === "security" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#74876B]" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="rounded-2xl border border-brand-border/60 bg-brand-card p-6 sm:p-8 shadow-sm transition-shadow duration-200">
        {activeTab === "personal" && (
          <div>
            <h2 className="mb-8 font-display text-xl font-medium text-brand-text-primary">
              Personal Details
            </h2>

            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-4 pt-2">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#74876B] text-3xl font-semibold text-[#F4EFE6] shadow-sm">
                  {fullName?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || "W"}
                </div>
                <button type="button" className={`${buttonStyles.ghost} text-xs`}>
                  Change Avatar
                </button>
              </div>

              {/* Personal Info Form */}
              <ProfileForm
                firstName={firstName}
                lastName={lastName}
                phone={phone}
                email={email}
                initialLocation={initialLocation}
                onboardingComplete={onboardingComplete}
              />
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div>
            <div className="mb-8 border-b border-brand-border/40 pb-4">
              <h2 className="font-display text-xl font-medium text-brand-text-primary">
                Your Travel Preferences
              </h2>
              <p className="mt-1 text-xs text-brand-text-secondary">
                View and edit your travel style, natural pace, interests, and guidelines anytime.
              </p>
            </div>
            <PreferencesForm />
          </div>
        )}

        {activeTab === "security" && (
          <div>
            <div className="mb-8 border-b border-brand-border/40 pb-4">
              <h2 className="font-display text-xl font-medium text-brand-text-primary">
                Account Security
              </h2>
              <p className="mt-1 text-xs text-brand-text-secondary">
                Update your password and secure your account.
              </p>
            </div>
            <SecurityForm />
          </div>
        )}
      </div>
    </div>
  );
}
