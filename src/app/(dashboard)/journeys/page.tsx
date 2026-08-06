import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { buttonStyles } from "@/lib/design";
import { PageHeader, EmptyState } from "@/components/dashboard";
import { getCachedSession } from "@/lib/auth/session-cache";
import { Prisma, JourneyStatus } from "@prisma/client";
import { JourneyListCard } from "@/components/journey/JourneyListCard";
import { JourneyDraftCard } from "@/components/journey/JourneyDraftCard";
import { JourneySearchInput } from "@/components/journey/JourneySearchInput";
import { JourneyFilters } from "@/components/journey/JourneyFilters";
import {
  countJourneyPlaces,
  formatJourneyDuration,
  formatJourneyDate,
  normalizeJourneyMetadata,
} from "@/lib/utils/journey";

export const metadata: Metadata = {
  title: "Journeys — Wayheld",
  description: "View and manage your Wayheld journeys.",
};

export default async function JourneysPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getCachedSession();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const userId = session.user.id;

  // 1. Extract and normalize search parameters
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page as string) || 1);
  const pageSize = 12;
  const skip = (page - 1) * pageSize;

  const query = typeof params.q === "string" ? params.q.trim() : "";
  const statusFilter = typeof params.status === "string" ? params.status : undefined;
  const sortParam = typeof params.sort === "string" ? params.sort : "newest";

  // 2. Build Where Clause — default list shows created READY journeys only.
  // Drafts have their own section. Filters can reveal archived / completed / etc.
  const whereClause: Prisma.JourneyWhereInput = {
    userId,
    deletedAt: null,
    status: "READY",
  };

  if (query) {
    whereClause.title = { contains: query, mode: "insensitive" };
  }

  if (
    statusFilter &&
    ["READY", "ARCHIVED", "GENERATING", "REFINING", "FAILED", "COMPLETED"].includes(
      statusFilter,
    )
  ) {
    whereClause.status = statusFilter as JourneyStatus;
  } else if (statusFilter === "ALL") {
    whereClause.status = { not: "DRAFT" };
  }

  // 3. Build OrderBy Clause
  let orderByClause: Prisma.JourneyOrderByWithRelationInput = { createdAt: "desc" };
  if (sortParam === "oldest") orderByClause = { createdAt: "asc" };
  if (sortParam === "updated") orderByClause = { updatedAt: "desc" };
  if (sortParam === "alphabetical") orderByClause = { title: "asc" };

  // 4. Data Layer execution (Single Transaction + _count)
  const [drafts, totalCount, journeys] = await prisma.$transaction([
    // First-class drafts section. Explore builds a card per destination, so
    // this needs headroom beyond a couple of hand-started drafts.
    prisma.journey.findMany({
      where: { userId, status: "DRAFT", deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        title: true,
        updatedAt: true,
        durationDays: true,
        originQuery: true,
      }
    }),
    // Total count for pagination
    prisma.journey.count({ where: whereClause }),
    // Paginated journey list
    prisma.journey.findMany({
      where: whereClause,
      orderBy: orderByClause,
      skip,
      take: pageSize,
      select: {
        id: true,
        title: true,
        status: true,
        durationDays: true,
        originQuery: true,
        primaryCountry: true,
        region: true,
        pace: true,
        createdAt: true,
        updatedAt: true,
        metadata: true,
      }
    })
  ]);

  const hasDrafts = drafts.length > 0;
  const hasJourneys = journeys.length > 0;
  const isFiltered = !!query || !!statusFilter;

  return (
    <>
      <PageHeader
        eyebrow="Journeys"
        title="Your journeys"
        description="Every slow-travel itinerary you've created lives here."
        actions={
          <Link href="/journeys/new" className={buttonStyles.primary}>
            Begin a New Journey
            <span aria-hidden className="text-base leading-none">
              →
            </span>
          </Link>
        }
      />
      
      {/* 1. Continue Journey — unfinished drafts */}
      {hasDrafts && (
        <div className="mb-12">
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-brand-text-secondary">
                In progress
              </p>
              <h2 className="font-display text-2xl font-light tracking-tight text-brand-text-primary">
                Continue Journey
              </h2>
            </div>
            <p className="max-w-sm text-sm text-brand-text-secondary">
              Pick up a draft where you left the builder.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {drafts.map((draft) => (
              <JourneyDraftCard
                key={draft.id}
                id={draft.id}
                title={draft.title || "Untitled Journey"}
                updatedDate={formatJourneyDate(draft.updatedAt)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. Created journeys (READY by default) */}
      <div>
        <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 w-full xl:w-auto xl:ml-auto">
            <JourneyFilters />
            <JourneySearchInput />
          </div>
        </div>
        
        {!hasJourneys ? (
          isFiltered ? (
            <EmptyState
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              title="No journeys found."
              description="Try adjusting your search or filters to find what you're looking for."
            />
          ) : statusFilter === "ARCHIVED" ? (
            <EmptyState
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              }
              title="No archived journeys"
              description="Journeys you archive will appear here."
            />
          ) : statusFilter === "COMPLETED" ? (
            <EmptyState
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              }
              title="No completed journeys"
              description="When a ready journey is finished, mark it completed and it will appear here."
            />
          ) : (
            <EmptyState
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              title="No journeys yet"
              description="Plan your first slow-travel journey and it will appear here."
            />
          )
        ) : (
          <div className="flex flex-col gap-4">
            {journeys.map(journey => {
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
                  duration={formatJourneyDuration(journey.durationDays, null, null)}
                  status={journey.status}
                  placeCount={countJourneyPlaces(journey.metadata)}
                  updatedDate={formatJourneyDate(journey.updatedAt)}
                />
              )
            })}
          </div>
        )}
      </div>
    </>
  );
}
