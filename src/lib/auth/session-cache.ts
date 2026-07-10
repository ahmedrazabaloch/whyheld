import { cache } from "react";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db";

/**
 * Deduplicated session fetcher.
 *
 * React's cache() memoises the result per request rendering scope.
 * Any component in the same server render tree that calls getCachedSession()
 * receives the already-resolved Session without re-invoking auth() or
 * triggering a second jwt() → database round-trip.
 *
 * Safe: each HTTP request gets its own isolated cache entry — no cross-user
 * data leakage between concurrent requests.
 */
export const getCachedSession = cache(auth);

/**
 * Deduplicated profile fetcher — one SQL round-trip.
 *
 * Fetches the profile fields shared across all dashboard pages. Keeping this
 * to a single SELECT (no nested relation) means it costs exactly one
 * database round-trip through the connection pooler.
 *
 * Fields returned:
 *   - layout.tsx        → (kicks off the promise early; result discarded)
 *   - dashboard/page    → firstName
 *   - settings/page     → firstName, lastName, homeCity, homeCountry, locale
 *   - profile/page      → firstName, lastName, avatarUrl
 *   - journeys/new page → onboardingCompletedAt
 *   - onboarding/page   → onboardingCompletedAt
 *
 * Travel preferences are in getCachedPreferences() so pages that do not need
 * them do not pay for a second SQL round-trip.
 */
export const getCachedProfile = cache(async (userId: string) => {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      firstName: true,
      lastName: true,
      avatarUrl: true,
      homeCity: true,
      homeCountry: true,
      locale: true,
      onboardingCompletedAt: true,
      city: true,
      state: true,
      country: true,
      latitude: true,
      longitude: true,
    },
  });
  return profile;
});

/**
 * Deduplicated travel-preferences fetcher — one SQL round-trip.
 *
 * Separated from getCachedProfile so that the five pages that never display
 * preferences (/dashboard, /billing, /journeys, /saved, /profile) do not
 * execute a second database round-trip. Only /settings awaits this function,
 * and it does so in a Promise.all alongside the already-in-flight profile
 * fetch so the two queries resolve in parallel.
 */
export const getCachedPreferences = cache(async (userId: string) => {
  const prefs = await prisma.travelPreference.findFirst({
    where: { profile: { userId } },
    select: {
      pace: true,
      transport: true,
      budget: true,
      avoidCrowds: true,
    },
  });
  return prefs;
});
