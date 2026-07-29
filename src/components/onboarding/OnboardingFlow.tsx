"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { buttonStyles, EASE_EXPO } from "@/lib/design";
import { STEPS } from "./onboarding.config";
import { useOnboarding } from "./useOnboarding";
import { StepStyle } from "./steps/StepStyle";
import { StepInterests } from "./steps/StepInterests";
import { StepPace } from "./steps/StepPace";
import { StepPreferences } from "./steps/StepPreferences";
import { StepComplete } from "./steps/StepComplete";

/** Maps step index → its component. */
const STEP_COMPONENTS = [
  StepStyle,
  StepInterests,
  StepPace,
  StepPreferences,
  StepComplete,
] as const;

/**
 * The full multi-step onboarding experience (frontend only). A persistent
 * progress rail sits beside the active step on desktop and collapses to a
 * compact bar on mobile. State lives in `useOnboarding`; nothing is sent to a
 * backend.
 */
export function OnboardingFlow() {
  const controller = useOnboarding();
  const reduceMotion = useReducedMotion();
  const { step, totalSteps, isLast, canAdvance, next, back, goTo } = controller;

  const ActiveStep = STEP_COMPONENTS[step];
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <main className="relative isolate flex min-h-svh w-full flex-col overflow-hidden bg-brand-bg text-brand-text-primary">
      {/* Ambient atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
        <motion.div
          animate={
            reduceMotion ? undefined : { x: [0, 30, 0], y: [0, 24, 0], opacity: [0.5, 0.85, 0.5] }
          }
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-[-10%] top-[-12%] h-[50vh] w-[50vh] rounded-full bg-brand-btn-primary/10 blur-[130px]"
        />
        <motion.div
          animate={
            reduceMotion ? undefined : { x: [0, -36, 0], y: [0, 28, 0], opacity: [0.4, 0.75, 0.4] }
          }
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute right-[-10%] top-[8%] h-[55vh] w-[55vh] rounded-full bg-brand-btn-primary/10 blur-[150px]"
        />
      </div>
      <div
        aria-hidden
        className="bg-grain pointer-events-none absolute inset-0 -z-10 opacity-[0.04] mix-blend-soft-light"
      />

      {/* Brand bar */}
      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-5 pt-7 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-brand-text-primary"
          aria-label="Wayheld home"
        >
          Wayheld
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-brand-border bg-brand-card px-4 py-2 text-xs font-semibold text-brand-text-primary shadow-xs transition-all duration-200 hover:border-brand-text-secondary hover:bg-white hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
        >
          Save & exit
        </Link>
      </header>

      {/* Mobile progress bar */}
      <div className="relative z-10 mx-auto mt-6 w-full max-w-5xl px-5 sm:px-6 lg:hidden">
        <div className="flex items-center justify-between text-[0.7rem] uppercase tracking-[0.18em] text-brand-text-secondary">
          <span>{STEPS[step].label}</span>
          <span>
            {step + 1} / {totalSteps}
          </span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-brand-border">
          <motion.div
            className="h-full rounded-full bg-brand-btn-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: EASE_EXPO }}
          />
        </div>
      </div>

      {/* Body: rail + step */}
      <div className="relative z-10 mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 gap-10 px-5 py-10 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-14">
        {/* Desktop rail */}
        <nav
          aria-label="Onboarding progress"
          className="hidden lg:col-span-4 lg:block"
        >
          <ol className="relative flex flex-col gap-1.5">
            {STEPS.map((s, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => (i <= step ? goTo(i) : undefined)}
                    disabled={i > step}
                    aria-current={active ? "step" : undefined}
                    className={`group flex w-full items-center gap-3.5 rounded-2xl px-3.5 py-3 text-left transition-all duration-300 ${
                      active
                        ? "bg-brand-text-primary/8 border border-brand-text-primary/10 shadow-xs"
                        : done
                          ? "hover:bg-brand-btn-primary/8"
                          : "opacity-60 hover:bg-brand-text-primary/3"
                    } ${i > step ? "cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300 ${
                        done
                          ? "border-[#74876B] bg-[#74876B] text-white shadow-xs"
                          : active
                            ? "border-[#33332F] bg-[#33332F] text-white shadow-xs ring-2 ring-[#33332F]/20"
                            : "border-brand-border bg-transparent text-brand-text-secondary/70"
                      }`}
                    >
                      {done ? (
                        <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden>
                          <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        s.index
                      )}
                    </span>
                    <span className="flex flex-col">
                      <span
                        className={`text-sm transition-colors ${
                          active
                            ? "font-bold text-brand-text-primary"
                            : done
                              ? "font-semibold text-brand-text-primary"
                              : "font-medium text-brand-text-secondary/80"
                        }`}
                      >
                        {s.label}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Active step card */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-brand-card-border bg-brand-card p-6 shadow-[0_40px_120px_-50px_rgba(51,51,47,0.1)] backdrop-blur-xl sm:p-8 lg:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={STEPS[step].id}
                initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
                transition={{ duration: 0.5, ease: EASE_EXPO }}
              >
                <ActiveStep {...controller} />
              </motion.div>
            </AnimatePresence>

            {/* Navigation (hidden on the final step, which has its own CTA) */}
            {!isLast && (
              <div className="mt-9 flex items-center justify-between border-t border-brand-border pt-6">
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 0}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-text-secondary transition-colors hover:text-brand-text-primary disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-btn-primary"
                >
                  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                    <path d="M16 10H4m0 0 4.5-4.5M4 10l4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back
                </button>

                <button
                  type="button"
                  onClick={next}
                  disabled={!canAdvance}
                  className={`${buttonStyles.primary} h-12 px-7 text-sm`}
                >
                  {step === totalSteps - 2 ? "Finish" : "Continue"}
                  <svg
                    aria-hidden
                    viewBox="0 0 20 20"
                    fill="none"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  >
                    <path d="M4 10h12m0 0-4.5-4.5M16 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
