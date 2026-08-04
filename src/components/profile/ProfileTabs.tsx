"use client";

import { useState } from "react";
import { ProfileForm } from "./ProfileForm";
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

type TabType = "personal" | "security";

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
      <div className="flex gap-2 overflow-x-auto border-b border-brand-border/80 no-scrollbar sm:gap-6">
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={`relative cursor-pointer whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
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
          onClick={() => setActiveTab("security")}
          className={`relative cursor-pointer whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
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

      <div className="rounded-2xl border border-brand-border/60 bg-brand-card p-6 shadow-sm transition-shadow duration-200 sm:p-8">
        {activeTab === "personal" && (
          <div>
            <h2 className="mb-8 font-display text-xl font-medium text-brand-text-primary">
              Personal Details
            </h2>

            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
              <div className="flex flex-col items-center gap-4 pt-2">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#74876B] text-3xl font-semibold text-[#F4EFE6] shadow-sm">
                  {fullName?.charAt(0).toUpperCase() ||
                    email?.charAt(0).toUpperCase() ||
                    "W"}
                </div>
                <button type="button" className={`${buttonStyles.ghost} text-xs`}>
                  Change Avatar
                </button>
              </div>

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
