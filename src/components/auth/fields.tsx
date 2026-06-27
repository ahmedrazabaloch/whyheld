"use client";

import { signIn } from "next-auth/react";
import { useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { formStyles } from "@/lib/design";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Error message; when present the field is styled and announced as invalid. */
  error?: string;
  /** Optional helper text shown when there's no error. */
  hint?: string;
}

/** Labelled text input on the Wayheld form system. */
export function TextField({
  label,
  error,
  hint,
  id,
  className,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className={formStyles.label}>
        {label}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`${formStyles.input} ${error ? "border-brand-btn-primary/60" : ""} ${className ?? ""}`}
        {...rest}
      />
      {error ? (
        <p id={`${fieldId}-error`} className={formStyles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className={formStyles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Password input with a show/hide toggle. */
export function PasswordField({
  label,
  error,
  hint,
  id,
  className,
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const [visible, setVisible] = useState(false);
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className={formStyles.label}>
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${formStyles.input} pr-12 ${error ? "border-brand-btn-primary/60" : ""} ${className ?? ""}`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-brand-text-secondary transition-colors hover:text-brand-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
        >
          {visible ? (
            <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
              <path d="M3 3l14 14M8.5 8.6a2 2 0 0 0 2.8 2.8M6.1 6.2C3.9 7.5 2.5 10 2.5 10s2.7 4.5 7.5 4.5c1.2 0 2.3-.3 3.2-.7M11 5.6C12.6 6 14 6.9 15 8c1.5 1.5 2.5 2 2.5 2s-.5.8-1.4 1.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
              <path d="M2.5 10S5.2 5.5 10 5.5 17.5 10 17.5 10 14.8 14.5 10 14.5 2.5 10 2.5 10Z" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="10" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          )}
        </button>
      </div>
      {error ? (
        <p id={`${fieldId}-error`} className={formStyles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className={formStyles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const GOOGLE_PATH =
  "M19.6 10.2c0-.6-.05-1.2-.16-1.8H10v3.4h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.1Z M10 20c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .95-3.4.95-2.6 0-4.8-1.75-5.6-4.1H1.1v2.6A10 10 0 0 0 10 20Z M4.4 11.95a6 6 0 0 1 0-3.85V5.5H1.1a10 10 0 0 0 0 9l3.3-2.55Z M10 4.05c1.45 0 2.75.5 3.8 1.5l2.85-2.85A10 10 0 0 0 1.1 5.5l3.3 2.6C5.2 5.8 7.4 4.05 10 4.05Z";

import { buttonStyles } from "@/lib/design";

/**
 * Social sign-in buttons. Google is wired to the NextAuth Google provider.
 */
export function SocialButtons({ callbackUrl = "/start" }: { callbackUrl?: string }) {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className={`${buttonStyles.secondary} w-full`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5" aria-hidden>
          <path d={GOOGLE_PATH} />
        </svg>
        Continue with Google
      </button>
    </div>
  );
}

/** "or" divider between social and email. */
export function OrDivider({ children = "or" }: { children?: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-brand-border" aria-hidden />
      <span className="text-[0.7rem] uppercase tracking-[0.2em] text-brand-text-secondary/70">
        {children}
      </span>
      <span className="h-px flex-1 bg-brand-border" aria-hidden />
    </div>
  );
}
