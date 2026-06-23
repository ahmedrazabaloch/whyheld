import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { PageHeader, EmptyState } from "@/components/dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New journey — Wayheld",
  description:
    "Plan a new slow-travel journey with Wayheld's AI-powered travel companion.",
};

export default async function NewJourneyPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signup");
  }

  return (
    <>
      <PageHeader
        eyebrow="New journey"
        title="Plan a journey"
        description="Describe where you'd like to go and Wayheld will craft a slow-travel itinerary around you."
      />

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
            <circle cx="14" cy="11" r="3" />
            <path d="M14 2a9 9 0 0 0-9 9c0 6.5 9 15 9 15s9-8.5 9-15a9 9 0 0 0-9-9z" />
          </svg>
        }
        title="Journey builder coming soon"
        description="The AI-powered journey planner is being built. You'll be able to describe your ideal trip and watch it come to life."
        action={
          <Link
            href="/journeys"
            className="inline-flex items-center gap-2 rounded-full border border-brand-border px-5 py-2.5 text-sm font-medium text-brand-text-primary transition-colors duration-300 hover:border-brand-text-secondary hover:bg-brand-text-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border"
          >
            Back to journeys
          </Link>
        }
      />
    </>
  );
}
