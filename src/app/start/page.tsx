import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getCachedProfile } from "@/lib/auth/session-cache";

export default async function StartPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await getCachedProfile(session.user.id);
  
  // 1. Is profile complete?
  const isProfileComplete = profile && profile.firstName && profile.phone && (profile.city || profile.country || profile.homeCity);
  
  if (!isProfileComplete) {
    redirect("/profile");
  }

  // 2. Is onboarding complete?
  if (!profile.onboardingCompletedAt) {
    redirect("/onboarding");
  }

  // 3. All complete -> dashboard
  redirect("/dashboard");
}
