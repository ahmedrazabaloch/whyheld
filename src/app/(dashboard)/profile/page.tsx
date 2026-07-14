import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard";
import { getCachedSession, getCachedProfile } from "@/lib/auth/session-cache";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { formStyles, buttonStyles } from "@/lib/design";
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
        description="Manage your personal details and account security."
      />

      <div className="mx-auto max-w-3xl space-y-12 pb-24">
        {/* Personal Details */}
        <section className="rounded-2xl border border-brand-border/60 bg-brand-card p-6 sm:p-8 shadow-sm transition-shadow duration-200">
          <h2 className="mb-8 font-display text-xl font-medium text-brand-text-primary">Personal Details</h2>
          
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4 pt-2">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#74876B] text-3xl font-semibold text-[#F4EFE6]">
                {fullName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "W"}
              </div>
              <button className={`${buttonStyles.ghost} text-xs`}>Change Avatar</button>
            </div>

            {/* Fields */}
            <ProfileForm
              firstName={profile?.firstName || ""}
              lastName={profile?.lastName || ""}
              phone={profile?.phone || ""}
              email={user.email || ""}
              initialLocation={initialLocation}
            />
          </div>
        </section>

        {/* Security */}
        <section className="rounded-2xl border border-brand-border/60 bg-brand-card p-6 sm:p-8 shadow-sm transition-shadow duration-200">
          <h2 className="mb-8 font-display text-xl font-medium text-brand-text-primary">Security</h2>
          <form className="space-y-6">
            <div className="space-y-2 max-w-md">
              <label className={formStyles.label}>Old Password</label>
              <input type="password" className={formStyles.input} placeholder="••••••••" />
            </div>
            <div className="space-y-2 max-w-md">
              <label className={formStyles.label}>New Password</label>
              <input type="password" className={formStyles.input} placeholder="••••••••" />
            </div>
            <div className="space-y-2 max-w-md">
              <label className={formStyles.label}>Confirm Password</label>
              <input type="password" className={formStyles.input} placeholder="••••••••" />
            </div>
            <div className="pt-4">
              <button type="button" className={`${buttonStyles.secondary}`}>Change Password</button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
