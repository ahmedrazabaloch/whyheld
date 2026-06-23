import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved places — Wayheld",
  description:
    "Your bookmarked destinations, stays, and experiences — saved for future journeys.",
};

export default async function SavedPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signup");
  }

  const savedCount = await prisma.savedPlace.count({
    where: { userId: session.user.id },
  });

  return (
    <>
      <PageHeader
        eyebrow="Saved"
        title="Saved places"
        description="Destinations, stays, and experiences you've bookmarked for later."
      />

      {savedCount === 0 ? (
        <EmptyState
          icon={
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 4H7a2 2 0 0 0-2 2v18l9-5 9 5V6a2 2 0 0 0-2-2z" />
            </svg>
          }
          title="Nothing saved yet"
          description="When you discover places that resonate with you, save them here and weave them into future journeys."
        />
      ) : (
        <div className="rounded-3xl border border-brand-card-border bg-brand-card p-6 sm:p-8 shadow-card">
          <p className="text-sm text-brand-text-secondary">
            You have{" "}
            <span className="font-medium text-brand-text-primary">{savedCount}</span> saved
            place{savedCount !== 1 ? "s" : ""}. Full saved-place management is
            coming soon.
          </p>
        </div>
      )}
    </>
  );
}
