import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — Wayheld",
  description:
    "Your Wayheld dashboard — view journeys, credits, and recommendations at a glance.",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signup");
  }

  if (!session.user.onboardingComplete) {
    redirect("/onboarding");
  }

  /* ---------------------------------------------------------------- */
  /* Real data reads — no mocks                                        */
  /* ---------------------------------------------------------------- */
  const [profile, wallet, journeyCount, savedCount, unreadCount] =
    await Promise.all([
      prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { firstName: true, onboardingCompletedAt: true },
      }),
      prisma.creditWallet.findUnique({
        where: { userId: session.user.id },
        select: { balance: true },
      }),
      prisma.journey.count({
        where: { userId: session.user.id, deletedAt: null },
      }),
      prisma.savedPlace.count({
        where: { userId: session.user.id },
      }),
      prisma.notification.count({
        where: { userId: session.user.id, readAt: null },
      }),
    ]);

  const greeting = profile?.firstName
    ? `Welcome back, ${profile.firstName}.`
    : "Welcome back.";

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={greeting}
        description="Here's an overview of your Wayheld experience."
      />

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Credits" value={wallet?.balance ?? 0} />
        <StatCard label="Journeys" value={journeyCount} />
        <StatCard label="Saved places" value={savedCount} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Journey prompt */}
        <div className="rounded-3xl border border-brand-card-border bg-brand-card p-6 sm:p-8 shadow-card">
          <h2 className="font-display text-lg font-light text-brand-text-primary">
            Start a new journey
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
            Tell Wayheld where you&apos;d like to go and we&apos;ll craft a slow-travel
            itinerary around your interests.
          </p>
          <Link
            href="/journeys/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-btn-primary px-5 py-2.5 text-sm font-semibold text-brand-bg transition-colors duration-300 hover:bg-brand-btn-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary-hover"
          >
            Plan a journey
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
              <path d="M1 7h12M8 2l5 5-5 5" />
            </svg>
          </Link>
        </div>

        {/* Notifications */}
        <div className="rounded-3xl border border-brand-card-border bg-brand-card p-6 sm:p-8 shadow-card">
          <h2 className="font-display text-lg font-light text-brand-text-primary">
            Notifications
          </h2>
          {unreadCount > 0 ? (
            <p className="mt-2 text-sm text-brand-text-secondary">
              You have{" "}
              <span className="font-medium text-brand-btn-primary">{unreadCount}</span>{" "}
              unread notification{unreadCount !== 1 ? "s" : ""}.
            </p>
          ) : (
            <p className="mt-2 text-sm text-brand-text-secondary/60">
              You&apos;re all caught up — no new notifications.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Small stat card                                                     */
/* ------------------------------------------------------------------ */

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-brand-card-border bg-brand-card px-5 py-4 shadow-card">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-brand-text-secondary/60">
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-light text-brand-text-primary">
        {value}
      </p>
    </div>
  );
}
