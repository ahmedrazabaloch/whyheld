import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding";
import { getCachedSession, getCachedProfile } from "@/lib/auth/session-cache";


export const metadata: Metadata = {
  title: "Set up your profile — Wayheld",
  description:
    "Tell Wayheld how you like to travel so we can craft journeys around you.",
};

export default async function OnboardingPage() {
  const session = await getCachedSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Onboarding status read directly from the profile record.
  // This is the only non-dashboard page that needs it, so we
  // fetch it here rather than paying a DB round-trip on every
  // jwt() callback across the entire app.
  const profile = await getCachedProfile(session.user.id);
  
  const isProfileComplete = profile && profile.firstName && profile.phone && (profile.city || profile.country || profile.homeCity);
  if (!isProfileComplete) {
    redirect("/profile");
  }

  if (profile?.onboardingCompletedAt) {
    redirect("/dashboard");
  }

  return <OnboardingFlow />;
}
