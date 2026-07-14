import { notFound, redirect } from "next/navigation";
import { loadDraft } from "@/actions/journey-actions";
import { JourneyBuilder } from "@/components/journey/JourneyBuilder";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth/auth";

export default async function JourneyBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [response, user] = await Promise.all([
    loadDraft(id),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { creditWallet: { select: { balance: true } }, plan: true }
    })
  ]);

  if (!response.success) {
    // If not a draft, maybe it's generated? Redirect to detail page
    redirect(`/journeys/${id}`);
  }

  const draft = response.data;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <JourneyBuilder 
        draft={draft} 
        userCredits={user?.creditWallet?.balance ?? 0}
        userPlan={user?.plan ?? "FREE"}
      />
    </div>
  );
}
