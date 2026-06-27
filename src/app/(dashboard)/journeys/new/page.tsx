import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { PageHeader } from "@/components/dashboard";

export default async function NewJourneyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Redirect to Onboarding if they haven't completed it
  if (!session.user.onboardingComplete) {
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
