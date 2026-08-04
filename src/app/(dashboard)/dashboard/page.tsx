import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard";
import { DashboardHub } from "@/components/dashboard/DashboardHub";
import { getCachedSession, getCachedProfile } from "@/lib/auth/session-cache";
import { getPlanCreditLimit } from "@/lib/membership/utils";

export const metadata: Metadata = {
  title: "Dashboard — Wayheld",
  description:
    "Your Wayheld dashboard — view journeys, credits, and recommendations at a glance.",
};

const journeySelect = {
  id: true,
  title: true,
  originQuery: true,
  primaryCountry: true,
  region: true,
} as const;

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
  const [profile, userDb, journeyCount, savedCount, unreadCount, latestDraft, latestReady] =
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
      prisma.journey.findFirst({
        where: { userId, deletedAt: null, status: "DRAFT" },
        orderBy: { updatedAt: "desc" },
        select: journeySelect,
      }),
      prisma.journey.findFirst({
        where: {
          userId,
          deletedAt: null,
          status: "READY",
        },
        orderBy: { updatedAt: "desc" },
        select: journeySelect,
      }),
    ]);

  const isFirstVisit = journeyCount === 0;
  const firstName = profile?.firstName?.trim();

  const greeting = isFirstVisit
    ? "Welcome to Wayheld."
    : firstName
      ? `Welcome back, ${firstName}.`
      : "Welcome back.";

  const supportingCopy = isFirstVisit ? (
    "Every meaningful journey begins with a place."
  ) : (
    <>
      Every journey has its own rhythm.
      <br />
      Where will yours lead next?
    </>
  );

  return (
    <>
      <div className="relative mb-8 overflow-hidden rounded-2xl">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[58%] md:block"
          aria-hidden
        >
          <div
            className="relative h-full w-full"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, black 14%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 14%, black 90%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          >
            <div className="absolute inset-x-0 top-[-46px] h-[170%]">
              <Image
                src="/illustrations/landscape.png"
                alt=""
                fill
                className="object-contain object-right"
                sizes="(min-width: 768px) 58vw, 0px"
                priority
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-full pb-8 md:max-w-[48%]">
          <div className="[&>div]:mb-0">
            <PageHeader
              eyebrow="Dashboard"
              title={greeting}
              description={supportingCopy}
            />
          </div>
          <div className="mt-8 w-fit border-t border-brand-border/60 pt-8">
            <h2
              id="dashboard-hub-title"
              className="font-display text-xl text-brand-text-primary sm:text-2xl"
            >
              What would you like to do?
            </h2>
          </div>
        </div>
      </div>

      <DashboardHub draft={latestDraft} ready={latestReady} />

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

      {/* Notifications */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-border/60 bg-brand-card p-6 sm:p-8 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <div className="relative z-10 max-w-[75%] sm:max-w-[70%]">
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

        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[42%] sm:block md:w-[20%]"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 22%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 22%)",
          }}
          aria-hidden
        >
          <Image
            src="/illustrations/envelope.png"
            alt=""
            fill
            className="object-cover object-right"
            sizes="(min-width: 640px) 280px, 0px"
          />
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
