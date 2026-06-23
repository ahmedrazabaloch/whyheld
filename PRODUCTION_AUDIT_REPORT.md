# Production Audit Report

**Date:** 2026-06-23  
**Scope:** Landing, signup, login, session, onboarding, dashboard readiness  
**Mode:** Staff engineer production-readiness audit with safe fixes only

---

## Executive Summary

The project now builds, lints, type-checks, and validates its Prisma schema. The highest-risk routing and onboarding flow defects were fixed without redesigning UI, changing typography, changing layout structure, or removing features.

The corrected flow is now:

`Landing CTA -> /start -> signup if guest -> onboarding if authed/incomplete -> dashboard if authed/complete`

The remaining production blocker is that `/dashboard` does not exist yet. I did not build it because the audit instructions explicitly said not to build the dashboard.

---

## Verification Results

### Required Commands

`npm run build`

```text
> wayheld@0.1.0 build
> next build

▲ Next.js 16.2.9 (Turbopack)
- Environments: .env

⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
  Creating an optimized production build ...
✓ Compiled successfully in 20.3s
✓ Finished TypeScript in 20.5s    
✓ Collecting page data using 3 workers in 2.2s    
✓ Generating static pages using 3 workers (9/9) in 561ms
✓ Finalizing page optimization in 49ms    

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/auth/[...nextauth]
├ ƒ /api/v1/auth/forgot-password
├ ƒ /api/v1/auth/reset-password
├ ƒ /api/v1/auth/signup
├ ƒ /api/v1/auth/verify-email
├ ƒ /api/v1/onboarding
├ ○ /forgot-password
├ ○ /login
├ ƒ /onboarding
├ ○ /reset-password
├ ○ /signup
├ ƒ /start
└ ○ /verify-email


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

`npm run lint`

```text
> wayheld@0.1.0 lint
> eslint
```

`npx tsc --noEmit`

```text
Command produced no output
```

`npx prisma validate`

```text
Loaded Prisma config from prisma.config.ts.

Prisma config detected, skipping environment variable loading.
Prisma schema loaded from prisma\schema.prisma
The schema at prisma\schema.prisma is valid 🚀
```

### Runtime Probes

| Check | Result |
| --- | --- |
| `GET /` | `200`, landing renders |
| `GET /signup` | `200`, signup renders |
| `GET /start` as guest | `307 /signup` |
| `GET /start` as authed incomplete user | `307 /onboarding` |
| `POST /api/v1/onboarding` as authed user | `200 {"ok":true}` |
| `GET /start` after onboarding completion | `307 /dashboard` |
| `GET /dashboard` as authed user | `404` because dashboard route is not built |
| `POST /api/v1/auth/signup` | `201`, user created |
| Credentials login through Auth.js + CSRF | `302`, session cookie created |
| Auth.js signout through CSRF | `302`, session cookie removed |
| `GET /api/auth/providers` | `200` in `163ms` |
| `POST /api/v1/auth/verify-email` invalid token | `400 INVALID_TOKEN` |
| `POST /api/v1/auth/forgot-password` | `200 {"ok":true}` |
| `POST /api/v1/auth/reset-password` invalid token | `400 INVALID_TOKEN` |
| Configured Unsplash image URLs | all `200` after fixes |
| Browser console on landing | no console errors observed |

---

## Issues Found And Root Causes

### 1. Landing CTAs Routed To Anchors Instead Of Product Flow

**Root cause:** Primary begin/start CTAs used `href="#start"`, which only scrolled the landing page. Some users then hit protected routes indirectly and saw `/login?callbackUrl=%2Fonboarding`, which is not the expected acquisition flow.

**Fix:** Added `/start` as the single auth-aware decision route and changed primary landing CTAs to point to `/start`.

### 2. Onboarding Completion Returned To Homepage

**Root cause:** `StepComplete` used a static link to `/`; onboarding was frontend-only and never marked `Profile.onboardingCompletedAt`.

**Fix:** Added a persisted onboarding API and changed the final action to save completion before navigating to `/dashboard`.

### 3. Onboarding Had No Persistence Or Resume Capability

**Root cause:** `useOnboarding` stored all answers in React state only.

**Fix:** Added `GET/PATCH/POST /api/v1/onboarding` and wired `useOnboarding` to load saved data, save progress on step advance, and complete atomically.

### 4. `GET /api/auth/providers` Failed / Felt Slow

**Root cause:** Auth.js rejected the runtime host with `UntrustedHost` because `NEXTAUTH_URL` pointed at another host/port. Auth code also imported Prisma at module load, increasing cold-start work for endpoints such as providers that do not need DB access.

**Fix:** Added `trustHost: true` and lazy-loaded DB-dependent modules inside auth callbacks/provider authorization.

### 5. Broken Unsplash Images Produced 404s

**Root cause:** Two configured Unsplash asset IDs returned `404`.

**Fix:** Replaced the broken Patagonia primary URL and Kerala fallback URL with verified `200` image URLs already consistent with the design.

### 6. Dashboard Target Is Missing

**Root cause:** There is no `src/app/dashboard` route. The roadmap expects it, but dashboard implementation is a future phase.

**Fix:** Not fixed by instruction. I verified the readiness gap and documented it.

---

## Files Changed

- `src/app/start/page.tsx`
- `src/app/api/v1/onboarding/route.ts`
- `src/app/onboarding/page.tsx`
- `src/components/onboarding/useOnboarding.ts`
- `src/components/onboarding/steps/StepComplete.tsx`
- `src/components/hero/Hero.tsx`
- `src/components/hero/HeroCtas.tsx`
- `src/components/hero/hero.config.ts`
- `src/components/sections/FinalCta.tsx`
- `src/components/sections/Membership.tsx`
- `src/components/sections/FeaturedJourneys.tsx`
- `src/components/sections/journeys.config.ts`
- `src/components/auth/fields.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/lib/auth/auth.ts`
- `src/middleware.ts`
- `PRODUCTION_AUDIT_REPORT.md`

---

## Fixes Applied

### Routing Improvements

- Added `/start` smart route:
  - guest -> `/signup`
  - authenticated and onboarding incomplete -> `/onboarding`
  - authenticated and onboarding complete -> `/dashboard`
- Updated primary begin/start CTAs from `#start` to `/start`:
  - Hero navbar Begin
  - Hero primary CTA
  - Final CTA Begin Your Journey
  - Membership plan CTAs
  - Featured journey Explore CTAs
- Updated login default callback to `/start` instead of hard-coding `/dashboard`.
- Updated social sign-in default callback to `/start`.
- Updated middleware guest-only auth route redirect from `/dashboard` to `/start` so authenticated users are classified by onboarding status.

### Auth Improvements

- Added `trustHost: true` to resolve Auth.js `UntrustedHost` errors.
- Lazy-loaded Prisma, password verification, validation schema, and provisioning code inside auth callbacks. This prevents provider metadata requests from paying the Prisma import/initialization cost.
- Fixed session enrichment to avoid conflicting with NextAuth's existing `emailVerified` typing.

### Onboarding Improvements

- Added persisted onboarding API:
  - `GET /api/v1/onboarding` loads saved profile/preference data.
  - `PATCH /api/v1/onboarding` saves partial progress.
  - `POST /api/v1/onboarding` completes onboarding and sets `Profile.onboardingCompletedAt`.
- Persisted mappings into existing schema tables:
  - `Profile`
  - `TravelPreference`
  - `TravelStyle`
  - `Interest`
  - `ProfileTravelStyle`
  - `ProfileInterest`
  - `UserActivity` on completion
- Added onboarding page guard:
  - unauthenticated -> `/signup`
  - completed -> `/dashboard`
  - incomplete -> onboarding flow
- Changed completion action from homepage navigation to persisted dashboard navigation.

### Image Improvements

- Replaced broken Unsplash URLs.
- Verified all configured Unsplash URLs return `200`.
- Browser console showed no image-related errors during landing render.

---

## Performance Findings

### Improvements Applied

- Auth providers endpoint improved from failing/slow behavior to `200` in `163ms` in the local production probe.
- Removed unnecessary top-level Prisma imports from the Auth.js provider metadata path.
- Removed verified broken remote image URLs, preventing failed image optimization requests and fallback churn.

### Remaining Bottlenecks

These were audited but not aggressively refactored because the instruction was to preserve visual design and layout.

1. **Homepage is almost entirely client-rendered.** `Hero`, section components, footer, and many child modules use `"use client"`, mainly for Motion effects.
2. **Motion is used broadly.** Largest client-heavy areas include `Hero`, `AiInsightPanel`, `OnboardingFlow`, `HowWayheldThinks`, `WhyTravelBroken`, `Membership`, and `FeaturedJourneys`.
3. **Largest generated chunks are sizable.** The biggest `.next/static/chunks` files observed were roughly `222KB`, `142KB`, several at `135.5KB`, and `110KB` before compression.
4. **Onboarding imports every step eagerly.** This is acceptable functionally, but first-load performance would improve with step-level dynamic splitting after the UX is stable.
5. **Remote Unsplash images still depend on external network latency.** They now resolve, but production should eventually move critical hero imagery to stable owned assets or a controlled CDN.
6. **Node 25 is in use locally.** This is newer than typical production LTS baselines; production should pin an LTS runtime compatible with Next.js 16.

### Safe Next Performance Work

- Convert non-interactive landing sections to server components where possible.
- Isolate Motion-heavy reveals into small client wrappers.
- Dynamically import non-initial onboarding steps.
- Add bundle analyzer configuration for route-level JS attribution.
- Add Lighthouse/Web Vitals measurement in CI.
- Consider static/local optimized hero assets for first viewport.

---

## Auth Flow Status

| Flow | Status | Notes |
| --- | --- | --- |
| Signup | Working | Runtime `201`, creates user and password hash path succeeds. |
| Credentials login | Working | Auth.js CSRF login created `authjs.session-token`. |
| Session persistence | Working | Session cookie created and used by `/start`. |
| Logout | Working | Signout removed session cookie. |
| Protected route guard | Working | Guest protected routes redirect. |
| Email verification | Partially working | Invalid token handling works. Valid-link E2E is blocked in production mode because the email stub does not deliver or log raw token. |
| Forgot password | Partially working | Endpoint returns `ok` and should create reset token for active users, but raw token is not deliverable in production mode without an email provider. |
| Reset password | Partially working | Invalid token handling works. Valid reset E2E requires access to delivered raw reset token. |
| Google OAuth | Configured, not fully verified | Provider appears in `/api/auth/providers`; external OAuth round trip was not completed in this audit. |

---

## Dashboard Readiness Status

**Status:** Not ready for dashboard launch.

What is ready:

- `User`, `Profile`, `CreditWallet`, `TravelPreference`, `Journey`, `SavedPlace`, `SavedJourney`, `DestinationRecommendation`, `Notification`, and `UserActivity` tables exist in schema.
- Relations validate with Prisma.
- Onboarding completion now writes the data dashboard needs to determine first-run state.
- Auth/session routing can send completed users to `/dashboard`.

What is missing:

- No `/dashboard` page route exists.
- No dashboard API route exists.
- No dashboard data loader/service exists.
- No widget-level error/loading contracts are implemented.
- Journey Builder routes are not implemented.
- Membership/billing backend is not implemented.
- Real transactional email provider is not implemented.

---

## Design System Migration Review

The client-provided palette was reviewed but not implemented.

New palette:

| Name | Hex |
| --- | --- |
| Warm Charcoal | `#33332F` |
| Lichen Gray | `#A8A69D` |
| Weathered Parchment | `#F4EFE6` |
| Moss Green | `#74876B` |

### Tokens That Must Change Later

Primary file: `src/app/globals.css`

Likely token migration:

- `forest-*` tokens: replace/deprecate into Warm Charcoal and Moss Green scale.
- `stone-*` tokens: align with Warm Charcoal and Lichen Gray.
- `mist-*` tokens: align with Weathered Parchment.
- `sun-*` tokens: decide whether Moss Green replaces CTA accent or whether a separate action/accent color remains required.
- `ocean-*` tokens: likely remove or demote; current palette has no blue family.
- Shadow tokens may need warmth reduction because current shadows assume near-black forest backgrounds.
- Selection color and focus ring should be remapped to the new CTA/accent decision.

### Components Impacted

- `src/lib/design.ts`: button, form, surface, option-card helpers.
- `src/app/globals.css`: Tailwind theme tokens and utilities.
- Hero components using `forest`, `mist`, `sun`, and `ocean` utility classes.
- Section components using current semantic colors.
- Auth forms and onboarding cards using current field/focus colors.
- Config atmosphere values in `hero.config.ts`.
- `DESIGN_SYSTEM.md` documentation.

### Migration Plan

1. Create semantic token aliases first (`canvas`, `surface`, `text-primary`, `text-muted`, `accent`, `focus`) without changing component markup.
2. Map existing components to semantic aliases gradually.
3. Swap semantic aliases to the new palette in one controlled pass.
4. Run screenshot regression checks for landing, auth pages, onboarding, and mobile breakpoints.
5. Update `DESIGN_SYSTEM.md` only after visual approval.

---

## Code Quality Findings

Fixed:

- Build, lint, and TypeScript all pass.
- React hook lint errors from the previous pass remain resolved.
- Broken image URLs resolved.
- Auth provider host error resolved.
- Onboarding no longer drops all state at completion.

Remaining:

- Several non-critical `href="#"` placeholders remain for legal/footer/brand-adjacent links. These are not part of the primary flow but should be replaced before launch.
- Email delivery is a stub and is not production-ready.
- Apple social button is intentionally disabled.
- Some roadmap/data docs still reference Prisma 7/Next.js 15 while the implementation uses Prisma 6/Next.js 16.
- `middleware.ts` uses the Next.js middleware convention that Next.js 16 warns is deprecated in favor of `proxy`.
- No automated tests exist for auth or onboarding.

---

## Before vs After

| Area | Before | After |
| --- | --- | --- |
| Primary landing CTAs | `#start` anchors / wrong flow | `/start` smart auth-aware flow |
| Guest begin flow | Could land on `/login?callbackUrl=%2Fonboarding` | `/signup` |
| Authenticated incomplete flow | Not centralized | `/start -> /onboarding` |
| Authenticated complete flow | Not centralized | `/start -> /dashboard` |
| Onboarding completion | Link to `/` | Persist data, then route to `/dashboard` |
| Onboarding persistence | React state only | DB-backed GET/PATCH/POST API |
| Providers endpoint | `500 UntrustedHost` during production probe | `200` in `163ms` |
| Auth module loading | Prisma imported at auth module load | Prisma lazy-loaded only where DB is needed |
| Image URLs | 2 configured Unsplash URLs returned `404` | All configured URLs return `200` |
| Build/lint/typecheck | Passing before this audit after earlier fixes | Still passing after production fixes |
| Dashboard | Missing | Still missing by instruction |

---

## Remaining Production Blockers

1. Build `/dashboard` or provide an approved temporary dashboard shell. Completed users currently route to `/dashboard`, but the route returns `404`.
2. Wire a real transactional email provider for verification and reset links.
3. Complete valid-token email verification and reset-password E2E tests once email delivery exists.
4. Add dashboard API/data layer.
5. Add automated tests for signup, login, session, onboarding persistence, and route guards.
6. Migrate from deprecated middleware convention to the Next.js 16 `proxy` convention.
7. Align docs with implementation versions: Prisma 6.19.3 and Next.js 16.2.9.
8. Add performance instrumentation and bundle analyzer.

---

## Recommended Next Phase

**Next phase should be Dashboard Foundation, not Journey Builder yet.**

Minimum scope:

1. Add authenticated `/dashboard` route.
2. Add dashboard data query/service for profile, wallet, onboarding state, and first-run empty states.
3. Add widget-level loading/error boundaries.
4. Add route tests for `/start`, `/onboarding`, `/dashboard`, login, logout.
5. Wire real transactional email before inviting external users.

Once dashboard exists and email is real, proceed to Journey Builder foundation.
