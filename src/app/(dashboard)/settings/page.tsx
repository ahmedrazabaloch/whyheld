import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard";
import { getCachedSession, getCachedProfile } from "@/lib/auth/session-cache";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { formatLocation } from "@/lib/location/service";

export const metadata: Metadata = {
  title: "Settings — Wayheld",
  description:
    "Manage your Wayheld profile, travel preferences, and account settings.",
};

export default async function SettingsPage() {
  const session = await getCachedSession();

  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const profile = await getCachedProfile(userId);
  const user = session.user;
  const fullName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.firstName || user.name || "";

  const formattedLocation = formatLocation(profile || {});
  const initialLocation =
    formattedLocation ||
    [profile?.homeCity, profile?.homeCountry].filter(Boolean).join(", ") ||
    "";

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Account settings"
        description="Manage your profile, travel preferences, and account security."
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
