"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createDraft } from "@/actions/journey-actions";

function NewJourneyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFired = useRef(false);
  const intent =
    searchParams.get("intent") === "explore" ? "explore" : "journey";

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    async function init() {
      const res = await createDraft({ intent });
      if (res.success) {
        router.replace(`/journeys/${res.data}/build`);
      } else {
        console.error(res.error);
      }
    }

    void init();
  }, [router, intent]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-border border-t-brand-btn-primary" />
      <p className="animate-pulse text-sm text-brand-text-secondary">
        {intent === "explore"
          ? "Preparing a place to explore…"
          : "Preparing your workspace…"}
      </p>
    </div>
  );
}

export default function NewJourneyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-border border-t-brand-btn-primary" />
          <p className="animate-pulse text-sm text-brand-text-secondary">
            Preparing your workspace…
          </p>
        </div>
      }
    >
      <NewJourneyInner />
    </Suspense>
  );
}
