"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createDraft } from "@/actions/journey-actions";
import { PageHeader } from "@/components/dashboard";

export default function NewJourneyPage() {
  const router = useRouter();
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    async function init() {
      const res = await createDraft();
      if (res.success) {
        router.replace(`/journeys/${res.data}/build`);
      } else {
        console.error(res.error);
        // Fallback error handling
      }
    }
    
    init();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-border border-t-brand-btn-primary" />
      <p className="text-sm text-brand-text-secondary animate-pulse">Preparing your workspace...</p>
    </div>
  );
}
