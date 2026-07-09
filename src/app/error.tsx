"use client";

import { useEffect } from "react";
import { buttonStyles } from "@/lib/design";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error securely on the client
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-brand-border/30 text-brand-text-primary">
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="mb-4 font-display text-2xl font-light text-brand-text-primary">Something went wrong</h2>
      <p className="mb-8 max-w-md text-brand-text-secondary">
        We hit an unexpected snag while loading this page. Please try again.
        {error.digest && (
          <span className="block mt-4 text-xs opacity-50">Reference ID: {error.digest}</span>
        )}
      </p>
      <button onClick={() => reset()} className={buttonStyles.primary}>
        Try Again
      </button>
    </div>
  );
}
