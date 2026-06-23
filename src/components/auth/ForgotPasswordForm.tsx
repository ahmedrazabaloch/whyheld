"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { buttonStyles, EASE_EXPO } from "@/lib/design";
import { TextField } from "./fields";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Forgot-password form. Sends a request to the forgot-password API (always
 * succeeds to prevent account enumeration), then shows a confirmation state.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(undefined);
    setSubmitting(true);

    try {
      await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always returns ok=true to prevent account enumeration, regardless of
      // whether the account exists.
      setSubmitting(false);
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_EXPO }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-brand-btn-primary/40 bg-brand-btn-primary/10 text-brand-btn-primary">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
              <path d="M4 6.5 12 12l8-5.5M4 6.5v11h16v-11M4 6.5h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <p className="font-display text-xl text-brand-text-primary">Check your inbox</p>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-brand-text-secondary">
              If an account exists for{" "}
              <span className="text-brand-text-primary">{email}</span>, a reset link is on
              its way. It may take a minute to arrive.
            </p>
          </div>
          <Link
            href="/login"
            className={`${buttonStyles.secondary} h-11 w-full text-sm`}
          >
            Back to sign in
          </Link>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-sm text-brand-btn-primary transition-colors hover:text-brand-btn-primary-hover"
          >
            Use a different email
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={handleSubmit}
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col gap-6"
        >
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            hint="We'll send a secure link to reset your password."
          />
          <button
            type="submit"
            disabled={submitting}
            className={`${buttonStyles.primary} h-12 w-full text-sm`}
          >
            {submitting ? "Sending link…" : "Send reset link"}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
