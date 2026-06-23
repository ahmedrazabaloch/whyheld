# Wayheld Design System

A premium, editorial, "luxury slow-travel technology" aesthetic. The system is
built on Tailwind CSS v4 `@theme` tokens (in `src/app/globals.css`) plus a small
set of shared composition helpers (in `src/lib/design.ts`). This document is the
single source of truth — when a value changes here, update the token, not the
component.

> **Principle:** Components compose tokens. They should not introduce new raw
> hex colors, ad-hoc font sizes, or one-off shadows.

---

## 1. Colors

All colors are defined as Tailwind theme tokens (`--color-*`) and consumed as
utilities like `bg-forest-950`, `text-mist-50`, `text-sun-400`.

### Forest — primary canvas (deep, calm)
| Token | Hex | Usage |
| --- | --- | --- |
| `forest-950` | `#0a1410` | Page / section background |
| `forest-900` | `#0f1f18` | Raised surfaces, cards (with opacity) |
| `forest-800` | `#153023` | Image placeholders, deepest cards |
| `forest-700` | `#1d4233` | Gradient placeholder start |
| `forest-600` | `#2c5e49` | Ambient glow |
| `forest-500` | `#3f7d63` | Ambient glow / subtle accents |

### Stone — neutral structure (reserved)
`stone-900 #1c1b18`, `stone-700 #44413a`, `stone-500 #6b675c`,
`stone-300 #a8a294`, `stone-100 #e4e0d6`.

### Mist — light text & surfaces
| Token | Hex | Usage |
| --- | --- | --- |
| `mist-50` | `#f6f5f0` | Primary text on dark, logo |
| `mist-100` | `#ecebe4` | Secondary text |
| `mist-200` | `#dcdacf` | Tertiary / muted text (used with opacity) |

### Ocean — cool accent
`ocean-600 #1f5d6b`, `ocean-500 #2c7d8f`, `ocean-400 #4ba3b3`. Used for cool
ambient glows and the AI panel glow.

### Sun — warm accent / CTA (the only "action" color)
| Token | Hex | Usage |
| --- | --- | --- |
| `sun-500` | `#e8a04b` | Warm glow |
| `sun-400` | `#f0b961` | Primary CTA fill, accent italic words, focus ring |
| `sun-300` | `#f6cd86` | Kicker labels, hover state of primary CTA |

### Opacity conventions
Text and borders use consistent alpha steps:
- Body text: `text-mist-200/80`, secondary `…/70`, muted `…/55`, faint `…/45`.
- Borders: hairline `border-mist-50/10`, default `…/12`, interactive `…/20`,
  hover `…/40`.
- Surfaces: `bg-forest-900/40` (cards), `/55`–`/70` (panels, featured).

---

## 2. Typography

### Font families
| Token | Stack | Usage |
| --- | --- | --- |
| `--font-sans` (`font-sans`) | Inter → system | Body, UI, labels |
| `--font-display` (`font-display`) | Fraunces → serif | Headlines, prices, quotes |

Loaded via `next/font/google` in `src/app/layout.tsx` as `--font-inter` and
`--font-fraunces`.

### Type scale
| Role | Classes | Notes |
| --- | --- | --- |
| Hero headline | `text-[clamp(2.75rem,7vw,5.5rem)]` | Fraunces, `font-light`, `leading-[0.98]`, `tracking-[-0.02em]` |
| Final-CTA headline | `text-[clamp(2.75rem,8vw,6rem)]` | Largest, mask-reveal |
| Section headline (H2) | `text-[clamp(2.25rem,5.5vw,4rem)]` | Fraunces, `font-light`, `leading-[1.02]`, `tracking-[-0.02em]` → token `text-section-title` |
| Card / stage title (H3) | `text-2xl … sm:text-3xl` | Fraunces |
| Lead paragraph | `text-base sm:text-lg`, `leading-relaxed` | `text-mist-200/80` |
| Body | `text-sm` / `text-base`, `leading-relaxed` | |
| Kicker / eyebrow | `text-xs font-medium uppercase tracking-[0.28em] text-sun-300` | → helper `kicker` |
| Overline label | `text-[0.7rem] font-medium uppercase tracking-[0.2em]` | column labels, meta |
| Chip / signal | `text-[0.68rem] font-medium tracking-wide` | |

### Accent word treatment
Emphasised words in headlines: `italic text-sun-400` (Fraunces italic).

---

## 3. Font sizes (raw reference)

`text-xs .75rem` · `text-sm .875rem` · `text-base 1rem` · `text-lg 1.125rem` ·
`text-xl 1.25rem` · `text-2xl 1.5rem` · `text-3xl 1.875rem` · `text-4xl 2.25rem`.
Custom: `0.62rem`, `0.65rem`, `0.68rem`, `0.7rem` for micro-labels;
`clamp()` values for fluid headlines (see §2).

---

## 4. Spacing scale

Tailwind's default 4px scale. Conventions used across the page:

| Purpose | Value |
| --- | --- |
| Section vertical padding | `py-24 sm:py-28 lg:py-36` → token `section-y` |
| Final CTA vertical padding | `py-28 sm:py-32 lg:py-44` |
| Container horizontal padding | `px-5 sm:px-6 lg:px-10` → token `container-x` |
| Max content width | `max-w-7xl` |
| Header → content gap | `pt-12 lg:pt-14` |
| Card padding | `p-5 sm:p-6` (panels), `p-7 sm:p-8` (plans) |
| Header to grid (within section) | `mt-14`–`mt-20` |
| Stack gaps | `gap-3` (CTAs), `gap-6`/`gap-7` (grids), `gap-2` (chips) |

The shared `Section` helper applies `section-y` + container automatically.

---

## 5. Border radius

| Token | Value | Usage |
| --- | --- | --- |
| `rounded-full` | pill | Buttons, chips, badges, dots |
| `rounded-xl` | `0.75rem` | Selector thumbnails |
| `rounded-3xl` | `1.5rem` | Cards, AI panel, plan cards |
| `rounded-4xl` | `2rem` | Featured stage |

---

## 6. Shadows

Defined as theme tokens so cards stay consistent:

| Token | Value | Usage |
| --- | --- | --- |
| `shadow-panel` | `0 30px 90px -50px rgba(0,0,0,0.95)` | AI panel |
| `shadow-card` | `0 40px 100px -50px rgba(0,0,0,0.95)` | Journey / plan cards |
| `shadow-stage` | `0 50px 120px -50px rgba(0,0,0,0.95)` | Featured stage |
| `shadow-featured` | `0 50px 120px -50px rgba(232,160,75,0.4)` | Highlighted plan (warm) |

(Consumed via `shadow-panel`, `shadow-card`, etc.)

---

## 7. Animation

### Easing
| Token | Value |
| --- | --- |
| `ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` — the house easing for reveals |

Framer Motion uses the same curve as the tuple `EASE` (`[0.16,1,0.3,1]`),
exported from `src/lib/design.ts` as `EASE_EXPO`.

### Durations
| Purpose | Value |
| --- | --- |
| Micro UI transition (hover, color) | `duration-300` |
| Reveal / entrance (Motion) | `0.8s`–`0.9s` |
| Image zoom (hover) | `duration-1200` (stage), `duration-1400` (cards) |
| Crossfade (image / atmosphere) | `1.1s` / `1.6s` |
| Ambient loops | `6s`–`22s`, `easeInOut`, infinite |

### Shared Motion variants (`src/lib/design.ts`)
- `containerVariants` — stagger parent.
- `riseVariants` — fade + rise + de-blur (the standard reveal).
- `fadeUpInView` helper for `whileInView` blocks.
- Viewport default: `{ once: true, amount: 0.4 }`.

All looping/parallax motion is gated on `useReducedMotion`, and a global
`prefers-reduced-motion` rule neutralises CSS transitions.

---

## 8. Section spacing & scaffolding

Every section shares the same chrome, provided by the `Section` component:
- `relative isolate w-full overflow-hidden bg-forest-950`
- `section-y` vertical padding
- Optional hairline top divider (`SectionDivider`)
- Optional grain layer (`GrainOverlay`)
- Inner container: `mx-auto w-full max-w-7xl container-x`

This guarantees consistent rhythm and prevents horizontal scroll
(`overflow-hidden` + container padding at every breakpoint).

---

## 9. Buttons

Shared via the `buttonStyles` map in `src/lib/design.ts`.

| Variant | Classes (summary) |
| --- | --- |
| `primary` | `rounded-full bg-sun-400 text-forest-950 font-semibold hover:bg-sun-300` + focus ring `outline-sun-300` |
| `secondary` | `rounded-full border border-mist-50/20 text-mist-100 hover:border-mist-50/40 hover:bg-mist-50/5` |
| `ghost` | text link with arrow, `text-mist-50 hover:text-sun-300` |

Common: `inline-flex items-center justify-center gap-2`, height `h-12`–`h-14`,
`transition` `duration-300`, visible focus ring
(`focus-visible:outline-2 focus-visible:outline-offset-2`).
The arrow icon nudges `group-hover:translate-x-0.5`.

---

## 10. Cards & surfaces

| Surface | Recipe |
| --- | --- |
| Standard card | `rounded-3xl border border-mist-50/12 bg-forest-900/40 shadow-card` |
| Glass panel (AI) | `rounded-3xl border border-mist-50/12 bg-forest-900/55 backdrop-blur-xl shadow-panel` |
| Featured stage | `rounded-4xl border border-mist-50/12 bg-forest-800 shadow-stage` |
| Highlighted plan | `rounded-3xl border border-sun-400/40 bg-forest-900/70 shadow-featured` |
| Chip / signal | `rounded-full border border-mist-50/12 bg-mist-50/5 px-2.5 py-1` |
| Badge (over image) | `rounded-full border border-mist-50/25 bg-forest-950/40 backdrop-blur-md` |

Cards use a consistent gradient scrim over imagery:
`bg-linear-to-t from-forest-950 via-forest-950/25 to-transparent`.

---

## 11. Forms

No data-entry forms exist on the landing page yet (the "AI panel" is a
presentational, non-interactive surface). The following standards apply when
forms are introduced, to stay on-system:

| Element | Recipe |
| --- | --- |
| Text input | `h-12 rounded-full border border-mist-50/20 bg-forest-900/50 px-5 text-mist-50 placeholder:text-mist-200/40` |
| Focus | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun-300` |
| Label | overline style: `text-[0.7rem] font-medium uppercase tracking-[0.2em] text-mist-200/55` |
| Submit | `buttonStyles.primary` |
| Error text | `text-sm text-sun-300` |

---

## 12. Accessibility & responsiveness

- Mobile-first; verified **no horizontal scroll** at 375 / 768 / 1280.
- All interactive elements have visible `focus-visible` rings (`outline-sun-300`
  or `outline-mist-50/40`).
- Decorative layers are `aria-hidden`; sections use `aria-labelledby`.
- Color contrast: `mist-50/100` on `forest-950` and `forest-950` on `sun-400`
  meet AA for text sizes used.
- Motion respects `prefers-reduced-motion`.
