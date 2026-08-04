import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard";
import { ExploreView } from "@/components/explore/ExploreView";
import { getCachedSession } from "@/lib/auth/session-cache";

export const metadata: Metadata = {
  title: "Explore — Wayheld",
  description:
    "Search a country, city, or place and discover routes worth lingering with.",
};

export default async function ExplorePage() {
  const session = await getCachedSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <>
      <PageHeader
        eyebrow="Explore"
        title="Explore"
        description="Search a place, refine with chips, then add what resonates to a journey."
      />
      <ExploreView />
    </>
  );
}
