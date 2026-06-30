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
 * Deduplicated profile fetcher.
 *
 * Fetches a superset of all profile fields used across dashboard pages
 * (layout, dashboard, settings, profile). Multiple calls with the same
 * userId within a single request share one database query.
 *
 * Fields returned cover every consumer:
 *   - layout.tsx      → firstName
 *   - dashboard/page  → firstName, onboardingCompletedAt
 *   - settings/page   → firstName, lastName, homeCity, homeCountry, locale, preferences
 *   - profile/page    → firstName, lastName, avatarUrl
 */
export const getCachedProfile = cache(async (userId: string) => {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: {
      firstName: true,
      lastName: true,
      avatarUrl: true,
      bio: true,
      homeCity: true,
      homeCountry: true,
      locale: true,
      timezone: true,
      onboardingCompletedAt: true,
      preferences: {
        select: {
          pace: true,
          transport: true,
          budget: true,
          avoidCrowds: true,
        },
      },
    },
  });
  return profile;
});
