
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";
import { INTERESTS, PACES, PREFERENCES, TRAVEL_STYLES } from "@/components/onboarding/onboarding.config";
import type { OnboardingData } from "@/components/onboarding/useOnboarding";

const styleIds = TRAVEL_STYLES.map((option) => option.id) as [string, ...string[]];
const interestIds = INTERESTS.map((option) => option.id) as [string, ...string[]];
const paceIds = PACES.map((option) => option.id) as [string, ...string[]];
const preferenceIds = PREFERENCES.map((option) => option.id) as [string, ...string[]];

const onboardingDataSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  style: z.enum(styleIds).nullable(),
  interests: z.array(z.enum(interestIds)),
  pace: z.enum(paceIds).nullable(),
  preferences: z.array(z.enum(preferenceIds)),
});

const saveSchema = z.object({
  step: z.number().int().min(0).max(5),
  data: onboardingDataSchema,
});

const completeSchema = saveSchema.refine(
  ({ data }) =>
    data.style !== null &&
    data.pace !== null &&
    data.interests.length > 0 &&
    data.preferences.length > 0,
  { message: "Onboarding is incomplete." },
);

const paceToDb = {
  "very-slow": "ONE_PLACE_DEEPLY",
  slow: "SLOW_UNHURRIED",
  balanced: "GENTLY_BALANCED",
} as const;

const dbToPace: Record<string, OnboardingData["pace"]> = {
  ONE_PLACE_DEEPLY: "very-slow",
  SLOW_UNHURRIED: "slow",
  GENTLY_BALANCED: "balanced",
};

function toDbPace(pace: string | null) {
  return pace ? paceToDb[pace as keyof typeof paceToDb] : undefined;
}

function splitName(name: string) {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(" ") || null };
}

function extrasStep(extras: unknown): number | null {
  if (extras && typeof extras === "object" && "onboardingStep" in extras) {
    const step = (extras as { onboardingStep?: unknown }).onboardingStep;
    return typeof step === "number" ? step : null;
  }
  return null;
}

function preferenceIdsFromDb(preferences?: {
  avoidCrowds: boolean;
  regenerativeOnly: boolean;
  localGuides: boolean;
  smallScale: boolean;
  lowWaste: boolean;
  transport: string;
} | null): string[] {
  if (!preferences) return [];
  return [
    preferences.regenerativeOnly ? "regenerative" : null,
    preferences.avoidCrowds ? "avoid-crowds" : null,
    preferences.transport === "RAIL_FIRST" ? "rail-first" : null,
    preferences.localGuides ? "local-guides" : null,
    preferences.smallScale ? "small-group" : null,
    preferences.lowWaste ? "plastic-free" : null,
  ].filter(Boolean) as string[];
}

async function saveOnboarding({
  userId,
  step,
  data,
  complete,
}: {
  userId: string;
  step: number;
  data: OnboardingData;
  complete: boolean;
}) {
  const { firstName, lastName } = splitName(data.name);
  const style = data.style
    ? TRAVEL_STYLES.find((option) => option.id === data.style)
    : null;
  const selectedInterests = INTERESTS.filter((option) =>
    data.interests.includes(option.id),
  );

  return prisma.$transaction(async (tx) => {
    const profile = await tx.profile.upsert({
      where: { userId },
      update: {
        firstName,
        lastName,
        ...(complete ? { onboardingCompletedAt: new Date() } : {}),
      },
      create: {
        userId,
        firstName,
        lastName,
        ...(complete ? { onboardingCompletedAt: new Date() } : {}),
      },
    });

    await tx.travelPreference.upsert({
      where: { profileId: profile.id },
      update: {
        pace: toDbPace(data.pace),
        transport: data.preferences.includes("rail-first") ? "RAIL_FIRST" : "MIXED",
        avoidCrowds: data.preferences.includes("avoid-crowds"),
        regenerativeOnly: data.preferences.includes("regenerative"),
        localGuides: data.preferences.includes("local-guides"),
        smallScale: data.preferences.includes("small-group"),
        lowWaste: data.preferences.includes("plastic-free"),
        extras: { onboardingStep: step },
      },
      create: {
        profileId: profile.id,
        pace: toDbPace(data.pace) ?? "SLOW_UNHURRIED",
        transport: data.preferences.includes("rail-first") ? "RAIL_FIRST" : "MIXED",
        avoidCrowds: data.preferences.includes("avoid-crowds"),
        regenerativeOnly: data.preferences.includes("regenerative"),
        localGuides: data.preferences.includes("local-guides"),
        smallScale: data.preferences.includes("small-group"),
        lowWaste: data.preferences.includes("plastic-free"),
        extras: { onboardingStep: step },
      },
    });

    await tx.profileTravelStyle.deleteMany({ where: { profileId: profile.id } });
    if (style) {
      const styleRecord = await tx.travelStyle.upsert({
        where: { slug: style.id },
        update: {
          name: style.label,
          description: style.description,
          glyph: style.glyph,
        },
        create: {
          slug: style.id,
          name: style.label,
          description: style.description,
          glyph: style.glyph,
        },
      });
      await tx.profileTravelStyle.create({
        data: { profileId: profile.id, styleId: styleRecord.id },
      });
    }

    await tx.profileInterest.deleteMany({ where: { profileId: profile.id } });
    for (const interest of selectedInterests) {
      const interestRecord = await tx.interest.upsert({
        where: { slug: interest.id },
        update: { name: interest.label, glyph: interest.glyph },
        create: { slug: interest.id, name: interest.label, glyph: interest.glyph },
      });
      await tx.profileInterest.create({
        data: { profileId: profile.id, interestId: interestRecord.id },
      });
    }

    if (complete) {
      await tx.userActivity.create({
        data: {
          userId,
          type: "ONBOARDING_COMPLETE",
          metadata: { step, style: data.style, pace: data.pace },
        },
      });
    }

    return profile;
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required." } },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          onboardingCompletedAt: true,
          preferences: true,
          styles: { select: { style: { select: { slug: true } } } },
          interests: { select: { interest: { select: { slug: true } } } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "User not found." } },
      { status: 404 },
    );
  }

  const profile = user.profile;
  const preferences = profile?.preferences;
  const data: OnboardingData = {
    name: [profile?.firstName, profile?.lastName].filter(Boolean).join(" "),
    email: user.email,
    style: profile?.styles[0]?.style.slug ?? null,
    interests: profile?.interests.map(({ interest }) => interest.slug) ?? [],
    pace: preferences ? dbToPace[preferences.pace] ?? null : null,
    preferences: preferenceIdsFromDb(preferences),
  };

  return NextResponse.json({
    data,
    step: extrasStep(preferences?.extras) ?? 0,
    onboardingComplete: profile?.onboardingCompletedAt != null,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required." } },
      { status: 401 },
    );
  }

  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Invalid onboarding data." } },
      { status: 422 },
    );
  }

  await saveOnboarding({
    userId: session.user.id,
    step: parsed.data.step,
    data: parsed.data.data,
    complete: false,
  });

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sign in required." } },
      { status: 401 },
    );
  }

  const parsed = completeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Complete all onboarding steps." } },
      { status: 422 },
    );
  }

  await saveOnboarding({
    userId: session.user.id,
    step: parsed.data.step,
    data: parsed.data.data,
    complete: true,
  });

  return NextResponse.json({ ok: true });
}
