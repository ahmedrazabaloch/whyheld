import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/dashboard";
import { getCachedSession } from "@/lib/auth/session-cache";
import { surfaces } from "@/lib/design";

export const metadata: Metadata = {
  title: "Favourites — Wayheld",
  description:
    "Your bookmarked destinations, stays, and experiences — saved for future journeys.",
};

export default async function SavedPage() {
  const session = await getCachedSession();

  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const savedPlaces = await prisma.savedPlace.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <PageHeader
        eyebrow="Favourites"
        title="Favourites"
        description="Your bookmarked destinations, stays, and experiences saved for future journeys."
      />

      {savedPlaces.length === 0 ? (
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
          title="No favourites saved yet"
          description="When you discover places that resonate with you along your journeys, bookmark them here to weave into future trips."
        />
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-brand-text-secondary font-medium tracking-wide">
            {savedPlaces.length} saved place{savedPlaces.length !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPlaces.map((place) => (
              <div
                key={place.id}
                className={`${surfaces.card} p-6 transition-all duration-200 hover:shadow-md flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className={`${surfaces.chip}`}>
                      {place.kind.replace(/_/g, " ")}
                    </span>
                    <span className="text-[0.65rem] text-brand-text-secondary/70">
                      {new Date(place.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-normal text-brand-text-primary mb-2">
                    {place.name}
                  </h3>
                  {place.note && (
                    <p className="text-sm text-brand-text-secondary font-light leading-relaxed line-clamp-3">
                      {place.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
