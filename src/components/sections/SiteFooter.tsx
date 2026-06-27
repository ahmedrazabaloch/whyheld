"use client";

import { motion } from "motion/react";
import { GrainOverlay } from "@/components/ui";
import { EASE_EXPO } from "@/lib/design";

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const COLUMNS: FooterColumn[] = [
  {
    title: "Explore",
    links: [
      { label: "Why Wayheld", href: "#why" },
      { label: "How it works", href: "#how" },
      { label: "Featured journeys", href: "#journeys" },
      { label: "Membership", href: "#membership" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our philosophy", href: "#why" },
      { label: "Regenerative travel", href: "#how" },
      { label: "Heritage partners", href: "#journeys" },
      { label: "Careers", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "#" },
      { label: "Contact us", href: "#" },
      { label: "Travel responsibly", href: "#why" },
      { label: "Status", href: "#" },
    ],
  },
];

const SOCIALS: { label: string; href: string; path: string }[] = [
  {
    label: "Instagram",
    href: "#",
    path: "M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.8-7.8a1.07 1.07 0 1 1-2.14 0 1.07 1.07 0 0 1 2.14 0ZM20 7.8c-.05-1.4-.37-2.64-1.4-3.66C17.58 3.12 16.34 2.8 14.94 2.74 13.5 2.66 9.5 2.66 8.06 2.74 6.66 2.8 5.42 3.12 4.4 4.14 3.37 5.16 3.05 6.4 3 7.8c-.08 1.44-.08 5.44 0 6.88.05 1.4.37 2.64 1.4 3.66 1.02 1.02 2.26 1.34 3.66 1.4 1.44.08 5.44.08 6.88 0 1.4-.06 2.64-.38 3.66-1.4 1.03-1.02 1.35-2.26 1.4-3.66.08-1.44.08-5.44 0-6.88Z",
  },
  {
    label: "X",
    href: "#",
    path: "M17.5 3h2.6l-5.7 6.5L21 21h-5.2l-4.1-5.3L6.9 21H4.3l6.1-7L3.5 3h5.3l3.7 4.9L17.5 3Zm-.9 16.3h1.45L8.3 4.6H6.75l9.85 14.7Z",
  },
  {
    label: "LinkedIn",
    href: "#",
    path: "M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.3 8.4h3.26V20H3.3V8.4Zm5.3 0h3.13v1.58h.05c.44-.82 1.5-1.68 3.08-1.68 3.3 0 3.9 2.16 3.9 4.98V20h-3.25v-5.14c0-1.22-.02-2.8-1.7-2.8-1.7 0-1.96 1.32-1.96 2.7V20H8.6V8.4Z",
  },
  {
    label: "YouTube",
    href: "#",
    path: "M21.6 7.2c-.23-.86-.9-1.54-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43c-.86.23-1.53.9-1.76 1.77C2 8.78 2 12 2 12s0 3.22.4 4.8c.23.86.9 1.54 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43c.86-.23 1.53-.9 1.76-1.77.4-1.58.4-4.8.4-4.8s0-3.22-.4-4.8ZM10 15V9l5.2 3-5.2 3Z",
  },
];

/**
 * Site footer — luxury editorial. Brand story on the left, navigation
 * columns, social placeholders and a legal bar. Fully responsive with no
 * horizontal overflow.
 */
export function SiteFooter() {
  return (
    <footer className="relative isolate w-full overflow-hidden border-t border-[rgba(244,239,230,0.15)] bg-[#74876B] text-[#F4EFE6]">

      <GrainOverlay opacity={0.05} />

      <div className="container-x mx-auto w-full max-w-7xl py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE_EXPO }}
          className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8"
        >
          {/* Brand story */}
          <div className="lg:col-span-5">
            <a
              href="#"
              className="font-display text-2xl tracking-tight text-white"
              aria-label="Wayheld home"
            >
              Wayheld
            </a>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[rgba(244,239,230,0.70)]">
              Wayheld is a slow travel companion, built on a simple belief: the
              world is not a checklist. We pair AI with local knowledge to help
              you travel with intention, honour heritage, and leave the places
              you love better than you found them.
            </p>

            {/* Social placeholders */}
            <div className="mt-7 flex items-center gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/60 transition-colors hover:border-white/40 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun-300"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5" aria-hidden>
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <p className="text-[0.75rem] font-bold uppercase tracking-[0.2em] text-[rgba(244,239,230,0.70)]">
                  {column.title}
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-[#F4EFE6] transition-colors hover:text-[#FFFFFF]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </motion.div>

        {/* Legal bar */}
        <div className="mt-14 flex flex-col gap-4 border-t border-[rgba(244,239,230,0.15)] pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[rgba(244,239,230,0.70)]">
            © {new Date().getFullYear()} Wayheld. Travel deeper, not faster.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[rgba(244,239,230,0.70)]">
            <li>
              <a href="#" className="transition-colors hover:text-[#FFFFFF]">
                Privacy
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-[#FFFFFF]">
                Terms
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-[#FFFFFF]">
                Cookies
              </a>
            </li>
            <li>
              <a href="#" className="transition-colors hover:text-[#FFFFFF]">
                Responsible travel
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
