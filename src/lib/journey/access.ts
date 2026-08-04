/**
 * Journey adjustment window + refinement quotas (doc: 5 refinements / 30 days).
 * PREMIUM skips the refinement count gate; access window still applies for clarity.
 */

export const MAX_REFINEMENTS = 5;
export const ACCESS_WINDOW_DAYS = 30;

export function accessExpiresAtFrom(now = new Date()): Date {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + ACCESS_WINDOW_DAYS);
  return d;
}

export function parseAccessExpiresAt(metadata: unknown): Date | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const raw = (metadata as Record<string, unknown>).accessExpiresAt;
  if (typeof raw !== "string" && !(raw instanceof Date)) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type AccessGateResult =
  | { ok: true; refinementsUsed: number; refinementsRemaining: number; accessExpiresAt: Date | null }
  | {
      ok: false;
      reason: "EXPIRED" | "REFINEMENTS_EXHAUSTED";
      message: string;
      refinementsUsed: number;
      refinementsRemaining: number;
      accessExpiresAt: Date | null;
    };

export function evaluateAccessGate(input: {
  accessExpiresAt: Date | null;
  /** Count of JourneyRefinement rows excluding INITIAL. */
  refinementsUsed: number;
  plan: string;
  now?: Date;
}): AccessGateResult {
  const now = input.now ?? new Date();
  const used = Math.max(0, input.refinementsUsed);
  const unlimited = input.plan === "PREMIUM";
  const remaining = unlimited
    ? Number.POSITIVE_INFINITY
    : Math.max(0, MAX_REFINEMENTS - used);
  const expires = input.accessExpiresAt;

  if (expires && now.getTime() > expires.getTime()) {
    return {
      ok: false,
      reason: "EXPIRED",
      message:
        "This journey’s adjustment window has closed. You can still read it — begin a new journey to plan again.",
      refinementsUsed: used,
      refinementsRemaining: remaining === Number.POSITIVE_INFINITY ? MAX_REFINEMENTS : remaining,
      accessExpiresAt: expires,
    };
  }

  if (!unlimited && used >= MAX_REFINEMENTS) {
    return {
      ok: false,
      reason: "REFINEMENTS_EXHAUSTED",
      message:
        "You’ve used your refinements for this journey. You can still read and reorder locked places without regenerating.",
      refinementsUsed: used,
      refinementsRemaining: 0,
      accessExpiresAt: expires,
    };
  }

  return {
    ok: true,
    refinementsUsed: used,
    refinementsRemaining:
      remaining === Number.POSITIVE_INFINITY ? MAX_REFINEMENTS : remaining,
    accessExpiresAt: expires,
  };
}

export function formatAccessDate(date: Date | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
