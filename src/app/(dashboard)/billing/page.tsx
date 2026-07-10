import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/dashboard";
import { getCachedSession } from "@/lib/auth/session-cache";
import { getMembershipPlans } from "@/lib/membership/getMembershipPlans";

export const metadata: Metadata = {
  title: "Billing — Wayheld",
  description:
    "Manage your Wayheld subscription, view credits, and review billing history.",
};

export default async function BillingPage() {
  // Cache hit — layout.tsx already resolved this session for this request.
  const session = await getCachedSession();

  // Narrow the type to satisfy TypeScript without using non-null assertions.
  // layout.tsx already guarantees an authenticated session.
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const [wallet, plans] = await Promise.all([
    prisma.creditWallet.findUnique({
      where: { userId },
      select: { balance: true, lifetimeGranted: true, lifetimeConsumed: true },
    }),
    getMembershipPlans(),
  ]);

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
      <div className="mt-12">
        <h3 className="font-display text-2xl tracking-tight text-brand-text-primary mb-6">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col h-full rounded-[2rem] border p-6 sm:p-8 shadow-sm ${
                plan.featured 
                  ? "border-[#74876B] bg-[#33332F] text-[#F4EFE6]" 
                  : "border-brand-border/60 bg-brand-card text-brand-text-primary"
              }`}
            >
              <h4 className={`font-display text-xl ${plan.featured ? "text-white" : ""}`}>{plan.name}</h4>
              <div className="mt-4 mb-6">
                <span className="font-display text-3xl font-bold">{plan.price}</span>
                {plan.cadence && <span className={`ml-2 text-sm ${plan.featured ? "text-[#A8A69D]" : "text-brand-text-secondary"}`}>{plan.cadence}</span>}
              </div>
              <ul className="flex-1 space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className={plan.featured ? "text-[#74876B]" : "text-brand-text-secondary"}>•</span>
                    <span className={plan.featured ? "text-[#F4EFE6]" : "text-brand-text-primary"}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-auto w-full rounded-full px-4 py-3 text-sm font-medium transition-colors ${
                  plan.featured
                    ? "bg-[#74876B] text-[#F4EFE6] hover:bg-[#68795f]"
                    : "border border-brand-border bg-transparent hover:bg-brand-border/30"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
