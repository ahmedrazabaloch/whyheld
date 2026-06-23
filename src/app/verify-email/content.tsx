"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { buttonStyles, EASE_EXPO } from "@/lib/design";
import { AuthShell } from "@/components/auth/AuthShell";

/**
 * Email verification form content — uses useSearchParams so it's wrapped in Suspense.
 */
export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<"verifying" | "success" | "error">(
    token ? "verifying" : "error",
  );
  const [error, setError] = useState<string | undefined>(
    token ? undefined : "Invalid verification link.",
  );

  useEffect(() => {
    if (!token) return;

    async function verify() {
      try {
        const res = await fetch("/api/v1/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setState("error");
          setError(
            data?.error?.message || "Email verification failed. Try again.",
          );
          return;
        }

        setState("success");
      } catch {
        setState("error");
        setError("Network error. Please try again.");
      }
    }

    verify();
  }, [token]);

  if (state === "verifying") {
    return (
      <AuthShell
        eyebrow="Verify email"
        title="Confirming…"
        subtitle="Please wait while we verify your email."
      >
        <div className="flex flex-col items-center gap-5 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-border border-t-brand-btn-primary"
          />
          <p className="text-sm text-brand-text-secondary">Verifying your email…</p>
        </div>
      </AuthShell>
    );
  }

  if (state === "success") {
    return (
      <AuthShell
        eyebrow="Verify email"
        title="Email verified!"
        subtitle="You can now sign in to your account."
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_EXPO }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-btn-primary/40 bg-brand-btn-primary/10 text-brand-btn-primary">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
              <path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <Link
            href="/login"
            className={`${buttonStyles.primary} h-11 w-full text-sm`}
          >
            Sign in
          </Link>
        </motion.div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Verify email"
      title="Verification failed"
      subtitle="This link may have expired or is invalid."
    >
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-brand-btn-primary">{error}</p>
        <Link
          href="/signup"
          className={`${buttonStyles.primary} h-11 text-sm`}
        >
          Try again
        </Link>
      </div>
    </AuthShell>
  );
}
