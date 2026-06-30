import { redirect } from "next/navigation";
import { getCachedSession, getCachedProfile } from "@/lib/auth/session-cache";
import { PageHeader } from "@/components/dashboard";

export default async function NewJourneyPage() {
  // Cache hit — layout.tsx already resolved this session for this request.
  const session = await getCachedSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Onboarding status is read from the profile record, not the JWT.
  // DashboardLayout already kicked off getCachedProfile, so this await
  // is a React cache hit — no additional DB round-trip.
  const profile = await getCachedProfile(session.user.id);
  if (!profile?.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  return (
    <>
      <PageHeader
        eyebrow="Journey Builder"
        title="Create a Journey"
        description="Craft your perfect slow-travel experience."
      />
      <div className="rounded-[2rem] border border-brand-border/60 bg-brand-card p-6 sm:p-8 shadow-sm">
        <p className="text-sm leading-relaxed text-brand-text-secondary">
          Journey builder interface coming soon.
        </p>
      </div>
    </>
  );
}
