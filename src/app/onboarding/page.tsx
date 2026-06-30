import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingFlow } from "@/components/onboarding";
import { auth } from "@/lib/auth/auth";


export const metadata: Metadata = {
  title: "Set up your profile — Wayheld",
  description:
    "Tell Wayheld how you like to travel so we can craft journeys around you.",
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signup");
  }

  if (session.user.onboardingComplete) {
    redirect("/dashboard");
  }

  return <OnboardingFlow />;
}
