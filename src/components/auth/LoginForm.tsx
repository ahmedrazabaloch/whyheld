"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";
import { buttonStyles } from "@/lib/design";
import { OrDivider, PasswordField, SocialButtons, TextField } from "./fields";

interface Errors {
  email?: string;
  password?: string;
  form?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Login form. Authenticates via the NextAuth Credentials provider and, on
 * success, navigates to the post-login destination (callbackUrl or smart start).
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/start";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const next: Errors = {};
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 1) next.password = "Password is required.";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setSubmitting(false);

    if (!result || result.error) {
      setErrors({ form: "Incorrect email or password." });
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <SocialButtons callbackUrl={callbackUrl} />
      <OrDivider>or continue with email</OrDivider>

      <div className="flex flex-col gap-5">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-brand-text-secondary">
          <button
            type="button"
            role="switch"
            aria-checked={remember}
            onClick={() => setRemember((v) => !v)}
            className={`relative h-5 w-9 rounded-full transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary ${
              remember ? "bg-brand-btn-primary" : "bg-brand-border"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-brand-bg transition-transform duration-300 ${
                remember ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
          Stay signed in
        </label>
        <Link
          href="/forgot-password"
          className="text-sm text-brand-btn-primary transition-colors hover:text-brand-btn-primary-hover"
        >
          Forgot password?
        </Link>
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
        {submitting ? "Signing you in…" : "Sign in"}
      </button>
    </form>
  );
}
