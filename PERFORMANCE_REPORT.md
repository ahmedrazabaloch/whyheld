# Performance Report

**Date:** 2026-06-23  
**Environment:** Local production build via `next start -p 3005`  
**Purpose:** Production stabilization profiling before new feature work

---

## Summary

The application is functionally fast on local server response timings, but the frontend architecture has clear future performance risks:

- The landing page is heavily client-rendered.
- Motion/animation code is used across most landing sections.
- The largest static chunks are significant.
- Critical visual content depends on remote Unsplash image optimization.
- Onboarding eagerly ships all step components and Motion code.

No image 404s were observed after the URL fixes from the previous stabilization pass.

---

## Methodology

Measured using:

- `npm run build`
- `npm start -- -p 3005`
- Node `fetch` runtime probes for server response timings
- Browser Performance API through Playwright for navigation timing, script resources, image resources, and console/image failures
- Static generated chunk inspection under `.next/static/chunks`
- Source audit for `"use client"`, `motion/react`, `AnimatePresence`, `useScroll`, and animation hooks

Notes:

- Measurements are local and should be treated as directional, not a replacement for Lighthouse/Web Vitals in a production-like network profile.
- Browser hydration is not directly exposed by React in this setup. `hydrationProxyMs` below uses `loadEventEnd - domContentLoadedEventEnd` as a rough post-DOM load proxy, not an exact React hydration metric.

---

## Server Response Timings

### Guest Pages / APIs

| Route | Status | Bytes | Server timing |
| --- | ---: | ---: | ---: |
| `/` | 200 | 91,890 | 92ms |
| `/signup` | 200 | 18,207 | 12ms |
| `/login` | 200 | 12,802 | 12ms |
| `/forgot-password` | 200 | 13,771 | 9ms |
| `/verify-email?token=invalid` | 200 | 8,691 | 11ms |
| `/reset-password?token=invalid` | 200 | 8,695 | 10ms |
| `/api/auth/providers` | 200 | 387 | 8ms |

### Authenticated Pages

| Route | Status | Redirect / Bytes | Server timing |
| --- | ---: | --- | ---: |
| `/start` | 307 | `/dashboard` | 29ms |
| `/onboarding` | 307 | `/dashboard` | 26ms |
| `/dashboard` | 200 | 19,473 bytes | 35ms |

### Interpretation

- Server render time is not the primary bottleneck locally.
- `/` is the largest HTML payload by far.
- Auth provider endpoint is now fast after the Auth.js host/lazy-import stabilization.
- Dashboard shell server render is acceptable at 35ms locally.

---

## Browser Navigation Timings

Measured through browser Performance API using `127.0.0.1:3005` to avoid an unrelated stale browser cookie issue in the integrated browser context.

| Route | DOMContentLoaded | Load | Response | Hydration proxy | Script count | Script transfer | Image transfer | Console errors |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| `/` | 207ms | 207ms | 7ms | 0ms | 11 | 0KB cached | 63KB transferred | none |
| `/signup` | 99ms | 104ms | 15ms | 6ms | 12 | 8KB | 0KB | none |
| `/login` | 103ms | 106ms | 20ms | 4ms | 13 | 16KB | 0KB | none |
| `/forgot-password` | 100ms | 102ms | 21ms | 3ms | 13 | 0KB cached | 0KB | none |
| `/verify-email?token=invalid` | 159ms | 159ms | 18ms | 0ms | 14 | 49KB | 0KB | expected 400 from invalid token API |
| `/reset-password?token=invalid` | 175ms | 176ms | 21ms | 0ms | 14 | 52KB | 0KB | none |

### Notes

- The landing route was cached in-browser for several script resources, so script transfer is underreported in that row.
- The invalid verification URL intentionally calls the API and receives `400 INVALID_TOKEN`; this creates a browser console resource error but is expected for the invalid-token test path.

---

## Image Audit

Configured Unsplash URLs were checked directly after stabilization. All configured URLs returned `200`.

Largest observed image resources in browser profiling:

| Image | Encoded size | Transfer |
| --- | ---: | ---: |
| Kerala main optimized image | 62KB | 63KB |
| Kyoto optimized image | 109KB encoded | cached transfer in profile |
| Patagonia optimized image | 106KB encoded | cached transfer in profile |
| Scotland optimized image | 42KB encoded | cached transfer in profile |
| Kerala selector image | 3KB encoded | cached transfer in profile |

Findings:

- No image-related 404s were observed.
- Next/Image optimization is working.
- Images are reasonably sized after optimization, but all primary landing media still depend on remote Unsplash availability.

Recommendations:

1. Move critical first-viewport imagery to owned/static assets or a controlled CDN before launch.
2. Keep Unsplash only as a non-critical fallback or editorial placeholder source.
3. Add image response checks to CI if remote URLs remain in source.

---

## Bundle / Chunk Audit

Largest generated chunks observed:

| Size | Chunk |
| ---: | --- |
| 222KB | `.next/static/chunks/3peubv2924kx4.js` |
| 142.2KB | `.next/static/chunks/1mfjqidm5qp0a.js` |
| 134.8KB | multiple generated chunks |
| 110KB | `.next/static/chunks/0cz1d0mv5g_q7.js` |
| 77.8KB | `.next/static/chunks/1qkxkl2vy9y9a.js` |
| 58.7KB | generated CSS chunk |
| 53.4KB | generated JS chunk |
| 43.4KB | generated JS chunk |
| 37.4KB | generated JS chunk |

Findings:

- Chunk sizes are not catastrophic, but they are large enough to justify route-level bundle analysis before launch.
- The app lacks a bundle analyzer script/config, so exact module attribution is not currently available.

Recommended next step:

- Add `@next/bundle-analyzer` or equivalent analyzer in a dedicated performance task.

---

## Client Component Audit

The source audit found extensive client component usage.

Major client-rendered areas:

- Hero system:
  - `Hero.tsx`
  - `FeaturedStage.tsx`
  - `AiInsightPanel.tsx`
  - `DestinationSelector.tsx`
  - `AtmosphereBackground.tsx`
  - `AnimatedHeadline.tsx`
  - `ResilientImage.tsx`
- Landing sections:
  - `WhyTravelBroken.tsx`
  - `HowWayheldThinks.tsx`
  - `SiteFooter.tsx`
- Auth shell/forms:
  - `AuthShell.tsx`
  - `SignupForm.tsx`
  - `ForgotPasswordForm.tsx`
  - reset/verify content pages
- Onboarding:
  - `OnboardingFlow.tsx`
  - all onboarding steps
  - `primitives.tsx`
  - `useOnboarding.ts`

Findings:

- The dashboard shell was intentionally implemented as a server component to avoid adding client cost.
- Landing page performance risk is mostly client JS and animation/hydration work, not server response time.
- Onboarding ships all steps up front and animates option cards; this contributes to first-load cost.

---

## Animation Audit

Motion usage is broad:

- `motion/react` imports are present across hero, sections, auth shell, onboarding, and verify/reset content.
- `AnimatePresence` is used in hero stage, AI panel, onboarding transitions, and forgot-password states.
- `useScroll` / `useTransform` are used for hero and `HowWayheldThinks` parallax.
- Looping or repeated animation exists in hero atmosphere, AI panel, showcase rotation, and onboarding atmosphere.

Safe changes already applied earlier:

- Previous lint-blocking setState-in-effect issues were resolved.
- Reduced motion gates exist in several components.

Remaining performance opportunities:

1. Convert static landing section copy/cards to server components.
2. Keep Motion only in small client wrappers around the animated elements.
3. Lazy-load below-the-fold landing sections.
4. Disable non-essential ambient loops on low-powered devices, not only reduced-motion users.
5. Dynamically import onboarding steps after the first step.

No additional animation removals were made in this pass because the instruction was to preserve current visual design and layout.

---

## Slow Pages / Risk Ranking

| Rank | Area | Reason |
| ---: | --- | --- |
| 1 | Landing `/` | Largest HTML payload, many client components, many Motion effects, remote images |
| 2 | Onboarding `/onboarding` | Eagerly imports full multi-step flow and Motion-heavy option cards |
| 3 | Verify/reset token pages | Client pages plus API calls; invalid verification logs expected 400 in console |
| 4 | Auth pages | Client forms and AuthShell animations, but small payloads |
| 5 | Dashboard `/dashboard` | Server component shell, currently low client cost |

---

## Oversized / Expensive Source Modules

Largest source files by line count from audit scan:

| Lines | File |
| ---: | --- |
| 265 | `src/app/api/v1/onboarding/route.ts` |
| 202 | `src/components/auth/SignupForm.tsx` |
| 194 | `src/components/onboarding/OnboardingFlow.tsx` |
| 181 | `src/components/onboarding/onboarding.config.ts` |
| 180 | `src/components/onboarding/useOnboarding.ts` |
| 172 | `src/components/hero/Hero.tsx` |
| 172 | `src/components/hero/AiInsightPanel.tsx` |
| 171 | `src/components/sections/HowWayheldThinks.tsx` |
| 169 | `src/components/sections/WhyTravelBroken.tsx` |
| 167 | `src/components/sections/Membership.tsx` |

Notes:

- Size alone is not a bug, but `OnboardingFlow`, hero, and section files are also client/Motion-heavy.
- `src/app/api/v1/onboarding/route.ts` is server-only and does not affect hydration, but it should be split into service helpers if it grows further.

---

## Current Performance Fixes Applied

- Dashboard shell implemented as a server component.
- Dashboard uses direct database reads on the server and no client state.
- Broken remote images removed from configuration.
- Auth provider endpoint optimized in prior stabilization by enabling trusted host handling and lazy DB imports.

---

## Recommended Performance Work Before Launch

1. Add a bundle analyzer and capture route-level JS attribution.
2. Convert static landing sections to server components where possible.
3. Split animated landing behavior into smaller client islands.
4. Dynamically import below-the-fold landing sections.
5. Dynamically import onboarding step components after Step 1.
6. Move first-viewport image assets to owned/static/CDN-hosted files.
7. Add Lighthouse CI or Web Vitals reporting for `/`, `/signup`, `/login`, `/onboarding`, and `/dashboard`.
8. Decide whether invalid-token verification should avoid browser console noise by rendering token validation server-side or using a non-error API status for handled invalid links.

---

## Verification Status

- Build: PASS
- Lint: PASS
- TypeScript: PASS
- Runtime dashboard route: PASS
- Onboarding persistence: PASS
- Session refresh: PASS
- Email verification field update: PASS
- Token cleanup: PASS
- Image URL 404 audit: PASS

---

## Conclusion

The current critical performance profile is acceptable for local production testing, but the landing page and onboarding flow are likely to become the main real-world bottlenecks because of broad client component and animation usage. The newly added dashboard shell is comparatively efficient because it is server-rendered and minimal.
