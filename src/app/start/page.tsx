import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getCachedProfile } from "@/lib/auth/session-cache";
import { DEFAULT_REDIRECT, safeRedirectPath } from "@/lib/auth/redirect";

/**
 * Post-authentication router.
 *
 * Only used when no explicit destination was requested (e.g. straight after
 * signup). Users with an incomplete profile are sent to fill it in first;
 * everyone else continues to their dashboard.
 */
export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { callbackUrl } = await searchParams;
  const destination = safeRedirectPath(callbackUrl, DEFAULT_REDIRECT);

  const profile = await getCachedProfile(session.user.id);
  const isProfileComplete =
    profile &&
    profile.firstName &&
    profile.phone &&
    (profile.city || profile.country || profile.homeCity);

  if (!isProfileComplete) {
    redirect("/profile");
  }

  redirect(destination);
}
