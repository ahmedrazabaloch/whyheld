"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useMemo, useState, type FormEvent } from "react";
import { buttonStyles } from "@/lib/design";
import { OrDivider, PasswordField, SocialButtons, TextField } from "./fields";
import { LocationAutocomplete } from "@/components/location/LocationAutocomplete";

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  terms?: string;
  form?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns 0–4 password strength score and a label. */
function scorePassword(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["Too short", "Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[score] };
}

/**
 * Signup form. Creates the account via the signup API, then signs the user in
 * with the Credentials provider and routes them into onboarding.
 */
export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [placeId, setPlaceId] = useState<string | undefined>();
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => scorePassword(password), [password]);

  function validate(): Errors {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Tell us what to call you.";
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8)
      next.password = "Password must be at least 8 characters.";
    if (!agreed) next.terms = "Please accept the terms to continue.";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          acceptedTerms: agreed,
          ...(placeId ? { placeId } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 409) {
          setErrors({ email: "An account with this email already exists." });
        } else if (data?.error?.fields) {
          const f = data.error.fields as Record<string, string[]>;
          setErrors({
            name: f.name?.[0],
            email: f.email?.[0],
            password: f.password?.[0],
            terms: f.acceptedTerms?.[0],
          });
        } else {
          setErrors({ form: "Something went wrong. Please try again." });
        }
        setSubmitting(false);
        return;
      }

      // Auto sign-in, then continue to onboarding.
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!result || result.error) {
        // Account created but sign-in failed — send them to login.
        router.push("/login");
        return;
      }
      router.push("/onboarding");
      router.refresh();
    } catch {
      setErrors({ form: "Network error. Please try again." });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <SocialButtons />
      <OrDivider>or sign up with email</OrDivider>

      <div className="flex flex-col gap-5">
        <TextField
          label="Full name"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <div className="flex flex-col gap-2">
          <PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          {password && !errors.password && (
            <div className="flex items-center gap-2">
              <div className="flex h-1 flex-1 gap-1" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                      i < strength.score ? "bg-brand-btn-primary" : "bg-brand-border"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[0.7rem] uppercase tracking-[0.16em] text-brand-text-secondary">
                {strength.label}
              </span>
            </div>
          )}
        </div>
        
        <LocationAutocomplete 
          label="Home Location (Optional)" 
          placeholder="Where are you based?"
          onChange={(id) => setPlaceId(id)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-brand-text-secondary select-none">
          <div
            role="checkbox"
            aria-checked={agreed}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary ${
              agreed
                ? "border-brand-btn-primary bg-brand-btn-primary text-brand-bg"
                : "border-brand-border bg-transparent"
            }`}
          >
            {agreed && (
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden>
                <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span>
            I agree to Wayheld&rsquo;s{" "}
            <Link href="#" className="text-brand-btn-primary hover:text-brand-btn-primary-hover">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-brand-btn-primary hover:text-brand-btn-primary-hover">
              Privacy Policy
            </Link>
            .
          </span>
          <input
            type="checkbox"
            className="hidden"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
        </label>
        {errors.terms && (
          <p className="text-xs text-brand-btn-primary" role="alert">
            {errors.terms}
          </p>
        )}
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
        {submitting ? "Creating your account…" : "Create account"}
      </button>
    </form>
  );
}
