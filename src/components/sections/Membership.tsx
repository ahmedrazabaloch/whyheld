"use client";

import { motion } from "motion/react";
import { Section } from "@/components/ui";
import { EASE_EXPO, kicker, leadParagraph, sectionTitle } from "@/lib/design";
import { featureHref } from "@/lib/auth/redirect";
import {
  MEMBERSHIP_HEADLINE,
  MEMBERSHIP_INTRO,
  MEMBERSHIP_KICKER,
  PLANS,
  type Plan,
} from "./membership.config";

function CheckMark({ accent }: { accent: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={`mt-0.5 h-4 w-4 shrink-0 ${accent ? "text-brand-btn-primary" : "text-brand-text-secondary/60"}`}
    >
      <path
        d="M3.5 8.5l3 3 6-7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlanCard({ plan, index, isAuthenticated }: { plan: Plan; index: number; isAuthenticated: boolean }) {
  const featured = plan.featured ?? false;
  const ctaHref = featureHref("/billing", isAuthenticated);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: EASE_EXPO, delay: index * 0.08 }}
      className={`relative flex flex-col h-full rounded-[2rem] border p-8 sm:p-9 transition-all duration-300 ${
        featured
          ? "border-[#74876B] bg-[#33332F] text-[#F4EFE6] shadow-[0_30px_60px_-15px_rgba(51,51,47,0.4)]"
          : "border-[#D8D2C8] bg-white text-[#33332F] shadow-[0_20px_50px_-20px_rgba(51,51,47,0.06)]"
      }`}
    >
      {/* Featured glow + ribbon */}
      {featured && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-px left-1/2 h-px w-3/4 -translate-x-1/2 bg-linear-to-r from-transparent via-[#74876B] to-transparent"
          />
          {plan.ribbon && (
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#74876B] px-4 py-1 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#F4EFE6] shadow-sm">
              {plan.ribbon}
            </span>
          )}
        </>
      )}

      <div>
        <h3 className={`font-display text-2xl ${featured ? "text-white" : "text-[#33332F]"}`}>
          {plan.name}
        </h3>
        <p className={`mt-2 text-sm leading-relaxed ${featured ? "text-[#A8A69D]" : "text-[#504F4A]"}`}>
          {plan.tagline}
        </p>
      </div>

      {/* Price */}
      <div className="mt-6 flex items-baseline gap-2">
        {plan.id === 'free' && (
          <span className="font-display text-4xl font-bold text-[#33332F]">
            {plan.price}
          </span>
        )}
        {plan.id === 'journey' && (
          <>
            <span className="font-display text-5xl font-bold tracking-tight text-[#33332F]">
              {plan.price}
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#74876B]">
              {plan.cadence}
            </span>
          </>
        )}
        {plan.id === 'premium' && (
          <>
            <span className="font-display text-5xl font-bold text-[#F4EFE6]">
              {plan.price}
            </span>
            <span className="text-sm uppercase text-[#A8A69D]">
              {plan.cadence}
            </span>
          </>
        )}
      </div>

      {/* Divider */}
      <span
        aria-hidden
        className={`mt-7 block h-px w-full ${featured ? "bg-white/10" : "bg-[#D8D2C8]/60"}`}
      />

      {/* Features */}
      <ul className="mt-7 flex flex-1 flex-col gap-4">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={`flex items-start gap-3.5 text-sm leading-snug ${
              featured ? "text-[#F4EFE6]" : "text-[#33332F]"
            }`}
          >
            <CheckMark accent={featured} />
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <div className="mt-auto pt-8">
        <a
          href={ctaHref}
          className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-full px-6 text-sm font-medium transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${
            featured
              ? "bg-[#74876B] text-[#F4EFE6] shadow-sm hover:bg-[#68795f] focus-visible:outline-[#74876B]"
              : "border border-[#D8D2C8] bg-white text-[#33332F] hover:-translate-y-[1px] hover:shadow-sm focus-visible:outline-[#D8D2C8]"
          }`}
        >
          {plan.cta}
        </a>
      </div>
    </motion.div>
  );
}

/**
 * "Membership" — three premium membership cards (not a SaaS comparison
 * table). The monthly membership is elevated and warmly highlighted.
 */
export function Membership({ plans, isAuthenticated }: { plans?: Plan[]; isAuthenticated?: boolean }) {
  // Use passed plans or fallback to config if not provided
  const displayPlans = plans && plans.length > 0 ? plans : PLANS;

  return (
    <Section
      id="membership"
      labelledBy="membership-heading"

    >
      <>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.85, ease: EASE_EXPO }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className={`${kicker} justify-center`}>
            <span className="h-px w-8 bg-brand-btn-primary/60" aria-hidden />
            {MEMBERSHIP_KICKER}
            <span className="h-px w-8 bg-brand-btn-primary/60" aria-hidden />
          </p>
          <h2 id="membership-heading" className={`mt-6 ${sectionTitle}`}>
            {MEMBERSHIP_HEADLINE.lead}{" "}
            <span className="italic text-brand-btn-primary">
              {MEMBERSHIP_HEADLINE.accent}
            </span>
            {MEMBERSHIP_HEADLINE.tail}
          </h2>
          <p className={`mx-auto mt-6 max-w-xl ${leadParagraph}`}>
            {MEMBERSHIP_INTRO}
          </p>
        </motion.div>

        {/* Plans */}
        <div className="mt-10 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:mt-12 lg:gap-7">
          {displayPlans.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} isAuthenticated={isAuthenticated ?? false} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 text-center text-xs uppercase tracking-[0.18em] text-brand-text-secondary/60"
        >
          Cancel anytime · No hidden fees · A portion funds heritage preservation
        </motion.p>
      </>
    </Section>
  );
}
