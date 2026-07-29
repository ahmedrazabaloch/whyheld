import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard";
import { getCachedSession, getCachedProfile } from "@/lib/auth/session-cache";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { formatLocation } from "@/lib/location/service";

export const metadata: Metadata = {
  title: "Profile — Wayheld",
  description: "Manage your personal profile and account security.",
};

export default async function ProfilePage() {
  // Cache hit — layout.tsx already resolved this session for this request.
  const session = await getCachedSession();

  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  // Cache hit — layout.tsx already started this profile for this request.
  const profile = await getCachedProfile(userId);

  const user = session.user;
  const fullName = profile?.firstName && profile?.lastName
    ? `${profile.firstName} ${profile.lastName}`
    : profile?.firstName || user.name || "";

  const formattedLocation = formatLocation(profile || {});
  const initialLocation = formattedLocation || [profile?.homeCity, profile?.homeCountry].filter(Boolean).join(", ") || "";

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Your Profile"
        description="Manage your personal details, travel preferences, and account security."
      />

      <ProfileTabs
        firstName={profile?.firstName || ""}
        lastName={profile?.lastName || ""}
        phone={profile?.phone || ""}
        email={user.email || ""}
        initialLocation={initialLocation}
        onboardingComplete={!!profile?.onboardingCompletedAt}
        fullName={fullName}
      />
    </>
  );
}
