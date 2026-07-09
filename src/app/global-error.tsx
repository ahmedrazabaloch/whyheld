"use client";

import { buttonStyles } from "@/lib/design";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-brand-bg p-6 text-center">
          <h2 className="mb-4 font-display text-2xl font-light text-brand-text-primary">Something went critically wrong</h2>
          <p className="mb-8 max-w-md text-brand-text-secondary">
            Our systems encountered an unrecoverable error. Please refresh the page to restart.
          </p>
          <button onClick={() => reset()} className={buttonStyles.primary}>
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
