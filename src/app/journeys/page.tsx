import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Journeys — Wayheld",
  description:
    "View and manage your Wayheld journeys — slow-travel itineraries crafted around your interests.",
};

export default async function JourneysPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signup");
  }

  const journeyCount = await prisma.journey.count({
    where: { userId: session.user.id, deletedAt: null },
  });

  return (
    <>
      <PageHeader
        eyebrow="Journeys"
        title="Your journeys"
        description="Every slow-travel itinerary you've created lives here."
        actions={
          <Link
            href="/journeys/new"
            className="inline-flex items-center gap-2 rounded-full bg-brand-btn-primary px-5 py-2.5 text-sm font-semibold text-brand-bg transition-colors duration-300 hover:bg-brand-btn-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary-hover"
          >
            New journey
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 1v12M1 7h12" />
            </svg>
          </Link>
        }
      />

      {journeyCount === 0 ? (
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
              <path d="M5 23c5-6 8-13 9-20" />
              <path d="M14 3c2 7 5 14 9 20" />
              <circle cx="5" cy="23" r="1.5" />
              <circle cx="23" cy="23" r="1.5" />
              <circle cx="14" cy="3" r="1.5" />
            </svg>
          }
          title="No journeys yet"
          description="Plan your first slow-travel journey and it will appear here — ready to refine, revisit, or share."
          action={
            <Link
              href="/journeys/new"
              className="inline-flex items-center gap-2 rounded-full bg-brand-btn-primary px-5 py-2.5 text-sm font-semibold text-brand-bg transition-colors duration-300 hover:bg-brand-btn-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary-hover"
            >
              Plan your first journey
            </Link>
          }
        />
      ) : (
        <div className="rounded-3xl border border-brand-card-border bg-brand-card p-6 sm:p-8 shadow-card">
          <p className="text-sm text-brand-text-secondary">
            You have{" "}
            <span className="font-medium text-brand-text-primary">{journeyCount}</span>{" "}
            journey{journeyCount !== 1 ? "s" : ""}. Full journey management is
            coming soon.
          </p>
        </div>
      )}
    </>
  );
}
