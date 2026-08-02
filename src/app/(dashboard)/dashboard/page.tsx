import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard";
import { getCachedSession, getCachedProfile } from "@/lib/auth/session-cache";
import { getPlanCreditLimit } from "@/lib/membership/utils";

export const metadata: Metadata = {
  title: "Dashboard — Wayheld",
  description:
    "Your Wayheld dashboard — view journeys, credits, and recommendations at a glance.",
};

export default async function DashboardPage() {
  // Cache hit — layout.tsx already resolved this session for this request.
  const session = await getCachedSession();

  // Layout guarantees an authenticated session, but we narrow the type
  // to satisfy TypeScript without using non-null assertions.
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  /* ---------------------------------------------------------------- */
  /* Real data reads — parallel, profile is a React cache() hit       */
  /* ---------------------------------------------------------------- */
  const [profile, userDb, journeyCount, savedCount, unreadCount] =
    await Promise.all([
      // Awaits the in-flight promise started by the layout — no extra DB call.
      getCachedProfile(userId),
      prisma.user.findUnique({
        where: { id: userId },
        select: { creditWallet: { select: { balance: true } }, plan: true },
      }),
      prisma.journey.count({
        where: { userId, deletedAt: null },
      }),
      prisma.savedPlace.count({
        where: { userId },
      }),
      prisma.notification.count({
        where: { userId, readAt: null },
      }),
    ]);

  const isFirstVisit = journeyCount === 0;
  const firstName = profile?.firstName?.trim();

  const greeting = isFirstVisit
    ? "Welcome to Wayheld."
    : firstName
      ? `Welcome back, ${firstName}.`
      : "Welcome back.";

  const supportingCopy = isFirstVisit
    ? "Every meaningful journey begins with a place."
    : "Every journey has its own rhythm. Where will yours lead next?";

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={greeting}
        description={supportingCopy}
      />

      {/* Stats row */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CreditsCard
          credits={userDb?.creditWallet?.balance ?? 0}
          plan={userDb?.plan ?? "FREE"}
        />
        <StatCard
          label="Journeys"
          value={journeyCount}
          helper="Places you've chosen to explore."
        />
        <StatCard
          label="Wishlist"
          value={savedCount}
          helper="Waiting for the right journey."
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Journey prompt */}
        <div className="rounded-2xl border border-brand-border/60 bg-brand-card p-6 sm:p-8 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <h2 className="font-display text-xl text-brand-text-primary">
            Begin a New Journey
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
            Choose a place that&apos;s been calling to you.
            <br />
            We&apos;ll help you uncover it slowly.
          </p>
          <Link
            href="/journeys/new"
            prefetch={false}
            className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-brand-btn-primary px-6 py-2.5 text-sm font-medium text-brand-bg shadow-sm transition-all duration-200 hover:-translate-y-[1px] hover:bg-brand-btn-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
          >
            Begin Exploring
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
        <div className="rounded-2xl border border-brand-border/60 bg-brand-card p-6 sm:p-8 shadow-sm transition-shadow duration-200 hover:shadow-md">
          <h2 className="font-display text-xl text-brand-text-primary">
            Notifications
          </h2>
          {unreadCount > 0 ? (
            <p className="mt-2 text-sm leading-relaxed text-brand-text-secondary">
              You have{" "}
              <span className="font-medium text-brand-btn-primary">{unreadCount}</span>{" "}
              unread notification{unreadCount !== 1 ? "s" : ""}.
            </p>
          ) : (
            <div className="mt-2 space-y-1.5">
              <p className="text-sm font-medium text-brand-text-primary">
                Nothing new today.
              </p>
              <p className="text-sm leading-relaxed text-brand-text-secondary">
                When something meaningful changes in one of your journeys,
                you&apos;ll find it here.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Small stat card                                                     */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="h-full flex flex-col justify-between rounded-2xl border border-brand-border/60 bg-brand-card px-6 py-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-brand-text-secondary/80">
        {label}
      </p>
      <div className="mt-2">
        <p className="font-display text-3xl tracking-tight text-brand-text-primary">
          {value}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-brand-text-secondary/80">
          {helper}
        </p>
      </div>
    </div>
  );
}

function creditsHelper(credits: number, plan: string): string {
  if (plan === "PREMIUM") {
    return "As many journeys as you need.";
  }
  if (credits <= 0) {
    return "When you're ready, another journey awaits.";
  }
  if (credits === 1) {
    return "One journey still remains.";
  }
  if (credits === 2) {
    return "Two journeys still remain.";
  }
  return `${credits} journeys still remain.`;
}

function CreditsCard({ credits, plan }: { credits: number; plan: string }) {
  const isPremium = plan === "PREMIUM";
  const isExhausted = !isPremium && credits <= 0;
  const limit = getPlanCreditLimit(plan);

  return (
    <div className="h-full rounded-2xl border border-brand-border/60 bg-brand-card px-6 py-5 shadow-sm transition-shadow duration-200 hover:shadow-md flex flex-col justify-between">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-brand-text-secondary/80">
        AI Credits
      </p>
      <div className="mt-2">
        <p
          className={`font-display text-3xl tracking-tight ${isExhausted ? "text-red-500" : "text-brand-text-primary"}`}
        >
          {isPremium
            ? "∞ Credits"
            : isExhausted
              ? "No Credits Remaining"
              : `${credits} / ${limit} Credits`}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-brand-text-secondary/80">
          {creditsHelper(credits, plan)}
        </p>
      </div>
    </div>
  );
}
