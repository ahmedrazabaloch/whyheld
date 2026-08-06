import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/dashboard";
import { getCachedSession } from "@/lib/auth/session-cache";
import { JourneyListCard } from "@/components/journey/JourneyListCard";
import {
  countJourneyPlaces,
  formatJourneyDuration,
  formatJourneyDate,
  normalizeJourneyMetadata,
} from "@/lib/utils/journey";

export const metadata: Metadata = {
  title: "Past Journeys — Wayheld",
  description: "Journeys you have marked as completed.",
};

export default async function PastJourneysPage() {
  const session = await getCachedSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  const journeys = await prisma.journey.findMany({
    where: {
      userId,
      deletedAt: null,
      status: "COMPLETED",
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      durationDays: true,
      originQuery: true,
      primaryCountry: true,
      region: true,
      pace: true,
      updatedAt: true,
      metadata: true,
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Past Journeys"
        title="Completed journeys"
        description="Journeys you have marked as completed live here."
      />

      {journeys.length === 0 ? (
        <EmptyState
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          }
          title="No completed journeys yet"
          description="When a ready journey is finished, mark it completed and it will appear here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {journeys.map((journey) => {
            const meta = normalizeJourneyMetadata({
              originQuery: journey.originQuery,
              primaryCountry: journey.primaryCountry,
              region: journey.region,
              pace: journey.pace,
            });

            return (
              <JourneyListCard
                key={journey.id}
                id={journey.id}
                title={journey.title || "Untitled Journey"}
                destination={meta.destination}
                duration={formatJourneyDuration(
                  journey.durationDays,
                  null,
                  null,
                )}
                status={journey.status}
                placeCount={countJourneyPlaces(journey.metadata)}
                updatedDate={formatJourneyDate(journey.updatedAt)}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
