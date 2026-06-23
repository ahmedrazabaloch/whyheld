"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { buttonStyles } from "@/lib/design";
import { PasswordField } from "@/components/auth/fields";
import { AuthShell } from "@/components/auth/AuthShell";

interface Errors {
  password?: string;
  form?: string;
}

/**
 * Reset password form content — uses useSearchParams so it's wrapped in Suspense.
 */
export function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <AuthShell
        eyebrow="Reset password"
        title="Invalid link"
        subtitle="This reset link is no longer valid."
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-brand-btn-primary">
            Invalid reset link. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className={`${buttonStyles.primary} h-11 text-sm`}
          >
            Request reset link
          </Link>
        </div>
      </AuthShell>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Errors = {};

    if (password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    if (password !== confirm) {
      next.password = "Passwords do not match.";
    }

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrors({
          form: data?.error?.message || "Failed to reset password.",
        });
        setSubmitting(false);
        return;
      }

      router.push("/login?message=Password+reset+successfully.+Sign+in+with+your+new+password.");
      router.refresh();
    } catch {
      setErrors({ form: "Network error. Please try again." });
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Set a new password"
      subtitle="Create a strong password you haven't used before."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-5">
          <PasswordField
            label="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <PasswordField
            label="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.password ? "" : undefined}
          />
        </div>

        {errors.form && (
          <p className="text-sm text-brand-btn-primary" role="alert">
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`${buttonStyles.primary} h-12 w-full text-sm`}
        >
          {submitting ? "Setting password…" : "Set password"}
        </button>

        <Link
          href="/login"
          className="text-center text-sm text-brand-btn-primary transition-colors hover:text-brand-btn-primary-hover"
        >
          Back to sign in
        </Link>
      </form>
    </AuthShell>
  );
}
