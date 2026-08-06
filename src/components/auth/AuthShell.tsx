"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_EXPO } from "@/lib/design";

interface AuthShellProps {
  /** Small eyebrow above the title */
  eyebrow: string;
  /** Page title (serif display) */
  title: ReactNode;
  /** Supporting line beneath the title */
  subtitle: string;
  children: ReactNode;
  /** Footer row, e.g. "Don't have an account? Sign up" */
  footer?: ReactNode;
}

/**
 * Shared chrome for every auth page (login / signup / forgot). Centres a
 * glass card over the signature Wayheld atmosphere — deep forest canvas,
 * breathing aurora glows, grain and vignette — so auth feels like a seamless
 * continuation of the landing experience, not a bolted-on form.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative isolate flex min-h-svh w-full flex-col overflow-hidden bg-brand-bg text-brand-text-primary">
      {/* Ambient atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { x: [0, 36, 0], y: [0, 24, 0], opacity: [0.6, 0.9, 0.6] }
          }
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-12%] top-[-10%] h-[55vh] w-[55vh] rounded-full bg-brand-btn-primary/10 blur-[130px]"
        />
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : { x: [0, -40, 0], y: [0, 30, 0], opacity: [0.5, 0.85, 0.5] }
          }
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute right-[-12%] top-[6%] h-[58vh] w-[58vh] rounded-full bg-brand-btn-primary/10 blur-[150px]"
        />
        <motion.div
          animate={
            reduceMotion ? undefined : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.06, 1] }
          }
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-[-25%] left-1/2 h-[55vh] w-[80vh] -translate-x-1/2 rounded-full bg-brand-btn-primary/5 blur-[150px]"
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_55%,var(--color-brand-bg)_100%)]"
      />
      <div
        aria-hidden
        className="bg-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.04] mix-blend-soft-light"
      />

      {/* Top brand bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-7 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-brand-text-primary"
          aria-label="Wayheld home"
        >
          Wayheld
        </Link>
        <Link
          href="/"
          className="rounded-full border border-brand-card-border bg-brand-card/70 px-4 py-2 text-sm text-brand-text-secondary shadow-[0_10px_30px_-24px_rgba(51,51,47,0.5)] backdrop-blur-md transition-colors hover:border-brand-btn-primary/40 hover:bg-brand-card hover:text-brand-text-primary"
        >
          Back to Home
        </Link>
      </header>

      {/* Centred card */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-5 py-12 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_EXPO }}
          className="w-full max-w-md rounded-3xl border border-brand-card-border bg-brand-card/90 p-7 shadow-[0_40px_120px_-50px_rgba(51,51,47,0.12)] backdrop-blur-xl sm:p-9"
        >
          <p className="inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.28em] text-brand-btn-primary">
            <span className="h-px w-7 bg-brand-btn-primary/60" aria-hidden />
            {eyebrow}
          </p>
          <h1 className="mt-5 font-display text-3xl font-light leading-tight tracking-[-0.02em] text-brand-text-primary sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-brand-text-secondary">
            {subtitle}
          </p>

          <div className="mt-8">{children}</div>

          {footer && (
            <div className="mt-8 border-t border-brand-border pt-6 text-center text-sm text-brand-text-secondary">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
