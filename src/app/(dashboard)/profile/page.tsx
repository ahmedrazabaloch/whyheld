import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard";
import { formStyles, buttonStyles } from "@/lib/design";

export const metadata: Metadata = {
  title: "Profile — Wayheld",
  description: "Manage your personal profile and account security.",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  const user = session.user;
  const fullName = profile?.firstName && profile?.lastName 
    ? `${profile.firstName} ${profile.lastName}` 
    : profile?.firstName || user.name || "";

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
            <form className="flex-1 space-y-8">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className={formStyles.label}>Full Name</label>
                  <input type="text" className={formStyles.input} defaultValue={fullName} placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <label className={formStyles.label}>Email</label>
                  <input type="email" className={formStyles.input} defaultValue={user.email || ""} disabled />
                </div>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className={formStyles.label}>Phone</label>
                  <input type="tel" className={formStyles.input} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                  <label className={formStyles.label}>Location</label>
                  <input type="text" className={formStyles.input} placeholder="City, Country" />
                </div>
              </div>

              <div className="pt-4 text-right">
                <button type="button" className={`${buttonStyles.primary}`}>Update Profile</button>
              </div>
            </form>
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
