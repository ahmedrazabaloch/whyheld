import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader, EmptyState } from "@/components/dashboard";
import { getCachedSession, getCachedProfile } from "@/lib/auth/session-cache";


export const metadata: Metadata = {
  title: "Settings — Wayheld",
  description:
    "Manage your Wayheld profile, travel preferences, and account settings.",
};

export default async function SettingsPage() {
  // Cache hit — layout.tsx already resolved this session for this request.
  const session = await getCachedSession();

  if (!session?.user?.id) {
    redirect("/signup");
  }

  // Cache hit — layout.tsx already fetched this profile for this request.
  // No separate prisma.profile.findUnique() needed — getCachedProfile returns
  // a superset that includes all fields this page needs.
  const profile = await getCachedProfile(session.user.id);

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Account settings"
        description="Manage your profile, travel preferences, and account."
      />

      {/* Profile summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard
          label="Name"
          value={
            [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
            "Not set"
          }
        />
        <InfoCard label="Email" value={session.user.email ?? "—"} />
        <InfoCard
          label="Home"
          value={
            [profile?.homeCity, profile?.homeCountry]
              .filter(Boolean)
              .join(", ") || "Not set"
          }
        />
        <InfoCard label="Locale" value={profile?.locale ?? "en"} />
      </div>

      {/* Travel preferences summary */}
      {profile?.preferences && (
        <div className="mb-6">
          <h2 className="mb-3 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-brand-text-secondary">
            Travel preferences
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PrefChip
              label="Pace"
              value={formatEnum(profile.preferences.pace)}
            />
            <PrefChip
              label="Transport"
              value={formatEnum(profile.preferences.transport)}
            />
            <PrefChip
              label="Budget"
              value={formatEnum(profile.preferences.budget)}
            />
            <PrefChip
              label="Avoid crowds"
              value={profile.preferences.avoidCrowds ? "Yes" : "No"}
            />
          </div>
        </div>
      )}

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
            <circle cx="14" cy="14" r="4" />
            <path d="M22.5 17a1.8 1.8 0 0 0 .36 2l.06.06a2.16 2.16 0 1 1-3.06 3.06l-.06-.06a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.08 1.62v.18a2.16 2.16 0 1 1-4.32 0v-.1a1.8 1.8 0 0 0-1.18-1.62 1.8 1.8 0 0 0-2 .36l-.06.06a2.16 2.16 0 1 1-3.06-3.06l.06-.06a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.62-1.08h-.18a2.16 2.16 0 1 1 0-4.32h.1a1.8 1.8 0 0 0 1.62-1.18 1.8 1.8 0 0 0-.36-2l-.06-.06A2.16 2.16 0 1 1 8.94 5.3l.06.06a1.8 1.8 0 0 0 2 .36h.1a1.8 1.8 0 0 0 1.08-1.62v-.18a2.16 2.16 0 1 1 4.32 0v.1a1.8 1.8 0 0 0 1.08 1.62 1.8 1.8 0 0 0 2-.36l.06-.06a2.16 2.16 0 1 1 3.06 3.06l-.06.06a1.8 1.8 0 0 0-.36 2v.1a1.8 1.8 0 0 0 1.62 1.08h.18a2.16 2.16 0 0 1 0 4.32h-.1a1.8 1.8 0 0 0-1.62 1.08z" />
          </svg>
        }
        title="Full settings editor coming soon"
        description="You'll be able to update your profile, adjust travel preferences, manage connected accounts, and control notifications here."
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-border/60 bg-brand-card px-6 py-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-brand-text-secondary/80">
        {label}
      </p>
      <p className="mt-2 text-sm text-brand-text-primary">{value}</p>
    </div>
  );
}

function PrefChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-border/60 bg-brand-card px-4 py-3 shadow-sm">
      <p className="text-[0.6rem] font-medium uppercase tracking-[0.18em] text-brand-text-secondary/80">
        {label}
      </p>
      <p className="mt-1 text-xs font-medium text-brand-text-primary">{value}</p>
    </div>
  );
}

/** Turn SCREAMING_SNAKE into Title Case for display. */
function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
