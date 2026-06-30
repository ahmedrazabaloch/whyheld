import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader, EmptyState } from "@/components/dashboard";
import { getCachedSession } from "@/lib/auth/session-cache";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Billing — Wayheld",
  description:
    "Manage your Wayheld subscription, view credits, and review billing history.",
};

export default async function BillingPage() {
  // Cache hit — layout.tsx already resolved this session for this request.
  const session = await getCachedSession();

  if (!session?.user?.id) {
    redirect("/signup");
  }

  const wallet = await prisma.creditWallet.findUnique({
    where: { userId: session.user.id },
    select: { balance: true, lifetimeGranted: true, lifetimeConsumed: true },
  });

  return (
    <>
      <PageHeader
        eyebrow="Billing"
        title="Billing & credits"
        description="View your credit balance, subscription, and billing history."
      />

      {/* Credit balance card */}
      <div className="mb-6 rounded-[2rem] border border-brand-border/60 bg-brand-card p-6 sm:p-8 shadow-sm transition-shadow duration-200 hover:shadow-md">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-brand-text-secondary/80">
          Credit balance
        </p>
        <p className="mt-2 font-display text-4xl tracking-tight text-brand-text-primary">
          {wallet?.balance ?? 0}
        </p>
        <div className="mt-4 flex gap-6 text-xs text-brand-text-secondary">
          <span>Granted: {wallet?.lifetimeGranted ?? 0}</span>
          <span>Used: {wallet?.lifetimeConsumed ?? 0}</span>
        </div>
      </div>

      {/* Subscription section */}
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
            <rect x="4" y="7" width="20" height="14" rx="3" />
            <path d="M4 12h20" />
            <path d="M8 18h4" />
          </svg>
        }
        title="Subscription management coming soon"
        description="You'll be able to upgrade your plan, manage payment methods, and review past invoices here."
      />
    </>
  );
}
