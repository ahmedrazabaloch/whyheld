import {
  evaluateAccessGate,
  formatAccessDate,
  MAX_REFINEMENTS,
  parseAccessExpiresAt,
  type AccessGateResult,
} from "@/lib/journey/access";
import { prisma } from "@/lib/db";

export type JourneyAccessInfo = {
  accessExpiresAt: string | null;
  accessExpiresLabel: string | null;
  refinementsUsed: number;
  refinementsRemaining: number;
  maxRefinements: number;
  canRegenerate: boolean;
  gateMessage: string | null;
  plan: string;
};

export async function loadJourneyAccessInfo(
  journeyId: string,
  userId: string,
): Promise<JourneyAccessInfo | null> {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId, userId },
    select: { metadata: true, user: { select: { plan: true } } },
  });
  if (!journey) return null;

  const refinementsUsed = await prisma.journeyRefinement.count({
    where: { journeyId, type: { not: "INITIAL" } },
  });

  const accessExpiresAt = parseAccessExpiresAt(journey.metadata);
  const plan = journey.user.plan || "FREE";
  const gate: AccessGateResult = evaluateAccessGate({
    accessExpiresAt,
    refinementsUsed,
    plan,
  });

  return {
    accessExpiresAt: accessExpiresAt?.toISOString() ?? null,
    accessExpiresLabel: formatAccessDate(accessExpiresAt),
    refinementsUsed: gate.refinementsUsed,
    refinementsRemaining:
      plan === "PREMIUM" ? MAX_REFINEMENTS : gate.refinementsRemaining,
    maxRefinements: MAX_REFINEMENTS,
    canRegenerate: gate.ok,
    gateMessage: gate.ok ? null : gate.message,
    plan,
  };
}
