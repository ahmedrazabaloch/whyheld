import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export const dynamic = "force-dynamic";

export default async function StartPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/signup");
  }

  redirect(session.user.onboardingComplete ? "/dashboard" : "/onboarding");
}
