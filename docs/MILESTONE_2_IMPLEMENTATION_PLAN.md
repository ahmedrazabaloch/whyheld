# Wayheld — Milestone 2 Master Implementation Plan

> **Version:** 1.0.0  
> **Created:** 2026-07-08  
> **Status:** Planning — No implementation has begun  
> **Source of truth:** This document + `docs/m2_architecture_review.md`  
> **Rule:** Every task in Milestone 2 must reference this document before starting and update the Change Log and Checklist when complete.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current Project State](#2-current-project-state)
3. [Architecture Overview](#3-architecture-overview)
4. [Development Order](#4-development-order)
5. [Feature Dependency Graph](#5-feature-dependency-graph)
6. [Journey Builder UX](#6-journey-builder-ux)
7. [Location Strategy](#7-location-strategy)
8. [AI Layer](#8-ai-layer)
9. [Database Changes](#9-database-changes)
10. [Route Structure](#10-route-structure)
11. [Shared Components](#11-shared-components)
12. [Performance Strategy](#12-performance-strategy)
13. [Security](#13-security)
14. [Risks](#14-risks)
15. [Milestone Checklist](#15-milestone-checklist)
16. [Change Log](#16-change-log)
17. [Development Rules](#17-development-rules)

---

## 1. Executive Summary

### What Milestone 2 Delivers

Milestone 2 transforms Wayheld from an authenticated shell into a fully operational slow-travel platform. At the end of this milestone, a user who has completed onboarding can:

1. **Set their home location** — via browser geolocation or Google Places Autocomplete — stored as structured geo data with ISO country code
2. **Create a journey** — specify a destination, dates, travellers, budget, and pace (pre-filled from their profile preferences)
3. **Generate an AI itinerary** — Claude produces a structured, editorially-voiced slow-travel plan streamed in real time, rendered stop-by-stop as it arrives
4. **View their itinerary** — full journey detail with an interactive map, stop cards, highlights, and day-by-day structure
5. **Refine their journey** — through natural language ("make it slower", "remove Lisbon") or quick-action buttons, with each refinement stored as immutable history giving Claude conversational memory
6. **Save journeys and places** — bookmark a whole journey or individual stops; saved places appear on a personal map
7. **Explore destinations** — browse AI and editorial destination recommendations; book recommendations gated to US users only
8. **Access past journeys** — a paginated, filterable list of all journeys with status indicators and a "Continue" affordance for unfinished drafts
9. **Manage their profile** — real, wired profile editing with name, location, avatar, and travel preferences — no longer a static form

### How It Fits the Overall Product

Milestone 1 established identity, authentication, and data foundations. Milestone 3 will add Stripe billing and subscription management. Milestone 2 is the **product core** — the features that justify Wayheld's existence. Without M2, Wayheld is a beautiful shell. With M2, it becomes the platform.

The architecture is designed so that Milestone 3 (billing) slots in as an enhancement layer on top of M2's credit system, not a restructuring of it. The credit wallet, entitlement checks, and subscription model are already in the schema; M2 wires the logic, M3 wires the payment processor.

### Product Philosophy (Non-Negotiable)

> **Wayheld is not an AI chatbot.** The AI behaves like a deeply experienced slow traveller who recommends from lived experience — not a large language model responding to commands. Every aspect of the AI layer (prompts, streaming UX, refinement language) must reflect this. The user is not "prompting" Claude. They are consulting a knowledgeable travel companion.

---

## 2. Current Project State

### Completed (Milestone 1)

| Area | Detail |
|---|---|
| Authentication | JWT sessions, credentials + Google OAuth, session caching with `react cache()` |
| Signup flow | `POST /api/v1/auth/signup`, email verification tokens, `CreditWallet` provisioning |
| Onboarding | 6-step flow (Account, Style, Interests, Pace, Preferences, Complete) with persistence and resume |
| Onboarding API | `GET /api/v1/onboarding`, `PATCH`, `POST` — transactional, Zod-validated |
| Database schema | Complete Prisma schema: all entities, enums, indexes, soft-delete, append-only ledger |
| Dashboard shell | Layout, sidebar nav, PageHeader, EmptyState, DashboardShell components |
| Dashboard page | Stats (credits, journeys, saved places), quick actions, notifications count |
| Journeys page | Count display + empty state (no list yet) |
| Profile page | Static display of name and email (form not wired) |
| Settings page | Travel preference display (read-only) |
| Design system | `design.ts` tokens, `globals.css` CSS tokens, `lib/design.ts` class recipes |
| Documentation | `BUSINESS_FLOW.md`, `DATA_ARCHITECTURE.md`, `PRODUCT_ROADMAP.md`, `DESIGN_SYSTEM.md` |

### In Progress

| Area | Detail |
|---|---|
| Architecture review | Completed — `docs/m2_architecture_review.md` |
| This implementation plan | You are reading it |

### Not Started (All of Milestone 2)

- Schema migration (location fields)
- `lib/ai/` module (Anthropic client, prompts, pipeline, output schemas)
- `lib/maps/` module (Places API wrapper, autocomplete proxy, place resolver)
- `lib/journeys/` module (entitlement, credit service, journey service)
- `lib/location/` module (location types, US gate function)
- Journey Builder UI and all sub-components
- Journey CRUD API routes
- Journey generation (streaming route handler)
- Journey refinement (streaming route handler)
- Maps proxy routes
- Profile page rebuild (functional form + server action)
- Location system (autocomplete + geo-detect + structured storage)
- Saved journeys and saved places pages + route handlers
- Explore destinations page and recommendations API
- Dashboard widget upgrades (Continue Journey, Journeys list, Credits pill)
- `useJourneyStore` Zustand store
- All shared components for M2

### Known Technical Debt

| Item | Impact | Plan |
|---|---|---|
| `Profile.homeCity`/`homeCountry` are free-text | Cannot enforce US book-rec gate reliably | Keep existing fields; add structured location fields alongside them in the schema migration |
| Profile page is a dead static form | Users cannot update any profile data | Rebuild entirely in Phase 6 of this plan |
| `getCachedProfile` does not select location fields | Location data unavailable to downstream consumers | Extend field list after schema migration |
| No error boundary infrastructure | A crashed widget crashes the whole dashboard page | Add `ErrorBoundary.tsx` to `components/ui/` early in M2 |
| Zustand installed but no stores created | State architecture undefined | Design and create `useJourneyStore` before any builder work |
| `@react-google-maps/api` installed but no integration | Maps library chosen but unused | Wire in Phase 2 (Maps Foundation) |
| `move/` API route has no clear purpose | Dead code in the API tree | Investigate and remove or document before M2 API work begins |

### Known UX Improvements (Deferred from M1)

| Item | Status |
|---|---|
| Journeys page shows only a count, no list or cards | To be addressed in Phase 4 |
| Settings page is read-only display | Editable settings in Phase 8 |
| Dashboard credits widget not wired to real wallet data | Phase 8 (Dashboard enhancement) |
| No loading skeleton infrastructure beyond the layout-level spinner | Add per-widget skeletons throughout M2 |

---

## 3. Architecture Overview

### 3.1 Frontend

The frontend is a **Next.js 16 App Router** application using the `(auth)` and `(dashboard)` route groups. All pages are **Server Components by default**. Client Components are used only where interactivity demands them (Journey Builder state, map rendering, autocomplete inputs, streaming UI).

**Key conventions:**
- `"use client"` only at the leaf that needs it, never at a page level unless the entire page is interactive
- Server Components fetch data directly using `prisma` — no API calls from the server to itself
- Client Components that need data receive it as props from their Server Component parent
- `dynamic(() => import('...'), { ssr: false })` for heavy client-only libraries (Maps)

**State layers:**

| Layer | Tool | Scope |
|---|---|---|
| Per-request server data | React `cache()` | Single HTTP request |
| Builder workspace state | Zustand (`useJourneyStore`) | Single page mount |
| Form state | `react-hook-form` | Single form mount |
| Optimistic mutations | Local `useState` + Server Action | Single component |
| Route validation | Server Component redirect | Per navigation |

### 3.2 Backend

All backend logic falls into one of three categories:

**1. Server Actions** — form mutations that need `revalidatePath`. Examples: profile update, save/unsave journey, save/unsave place, preferences update.

**2. Route Handlers (`/api/v1/`)** — used for: streaming responses, mobile-compatible endpoints, anything requiring explicit HTTP status codes (402, 403, 409), and all Maps proxy calls. Every route handler is in `/api/v1/` for mobile parity.

**3. Server Components with direct Prisma access** — read-only data fetching for page renders. No API call round-trip from server to itself.

**Rule:** Server Actions cannot return meaningful HTTP status codes. Any endpoint needing `402 Payment Required` or `403 Forbidden` must be a Route Handler.

### 3.3 Database

**PostgreSQL** via **Prisma 6**. The schema is complete for all M2 features with one required addition: structured location fields on `Profile`.

**Design principles already in place:**
- Append-only ledger for credits (`CreditTransaction`)
- Soft delete on `User` and `Journey`
- AI audit trail (`AiGeneration` + `AiPromptLog`)
- Geo-ready everywhere (`googlePlaceId`, `latitude`, `longitude` on stops and places)
- Immutable refinement history (`JourneyRefinement` with `fromVersion`/`toVersion`)

**Connection pattern:** Single `PrismaClient` singleton in `lib/db.ts`. In production, a connection pooler (PgBouncer via Supabase/Neon) is required.

### 3.4 AI Layer

**Provider:** Anthropic Claude (SDK `@anthropic-ai/sdk ^0.105.0` already installed).

**Architecture:** A centralised, server-only pipeline module at `lib/ai/pipeline.ts`. This module is the only entry point for any Claude call. It enforces:
- Entitlement check before calling the API
- Streaming with NDJSON envelope
- Zod validation of all output before any DB write
- Atomic credit debit on success
- Automatic credit refund on failure
- Full audit record in `AiGeneration` + `AiPromptLog`

**Model:** `claude-3-5-sonnet-20241022` (or as configured in `ANTHROPIC_MODEL` env var). Prompt version is tracked in each `AiGeneration` record.

**Voice:** The AI presents as an experienced slow traveller, not an assistant. The system prompt encodes Wayheld's editorial philosophy: no tourist traps, local over chain, small-scale, regenerative, pace-aware.

### 3.5 Journey Engine

The Journey Engine is the orchestration system for creating, generating, and refining journeys. It consists of:

- **Journey service** (`lib/journeys/journey-service.ts`): shared CRUD helpers
- **Entitlement service** (`lib/journeys/entitlement.ts`): credit/subscription gate
- **Credit service** (`lib/journeys/credit-service.ts`): atomic pre-auth + commit + refund
- **AI pipeline** (`lib/ai/pipeline.ts`): Claude call orchestrator
- **Place resolver** (`lib/maps/place-resolver.ts`): stop name → Google Place ID + coordinates

**Journey state machine** (enforced server-side only):

```
DRAFT → GENERATING → READY → REFINING → READY (loop)
                  ↘ FAILED → DRAFT (retry)
READY → ARCHIVED
```

### 3.6 Profile

The profile system manages personal data, travel preferences, and user location. After M2:

- `Profile` stores name, avatar, bio, home location (structured), locale, timezone, onboarding completion
- `TravelPreference` stores pace, transport, budget, toggles (avoid crowds, etc.)
- `ProfileTravelStyle` and `ProfileInterest` (many-to-many joins with weights)
- All profile fields are editable through a rebuilt profile page with a live Server Action
- Location is updated through `LocationAutocomplete` (Google Places Autocomplete proxied through `/api/v1/maps/`)

### 3.7 Preference Memory

User travel preferences pre-fill the Journey Builder form on every new journey:
- Pace → pre-selected pace chip
- Budget → pre-selected budget tier
- Transport → pre-selected transport option
- Interests → surfaced as "journey themes" in the builder
- `avoidCrowds` → toggle pre-set in refinement panel

Preferences are also injected into the AI system prompt at generation time, so Claude knows the user's travel personality before the destination is specified.

### 3.8 Streaming

Both `generate` and `refine` endpoints stream using `ReadableStream` with NDJSON (newline-delimited JSON) format. This works on Vercel's Node.js runtime (not SSE, which requires the Edge runtime).

**Stream events:**

```
{"type":"start","journeyId":"..."}
{"type":"meta","title":"...","summary":"...","durationDays":7}
{"type":"stop","order":1,"name":"...","description":"...","latitude":...,"longitude":...}
{"type":"stop","order":2,...}
{"type":"done","status":"READY","stopsCount":5,"version":1}
{"type":"error","code":"GENERATION_FAILED","message":"..."}
```

The client reads these events and:
1. Shows a "Wayheld is planning your journey" state on `start`
2. Renders `meta` as the journey header
3. Animates each `stop` card in as it arrives
4. Maps each stop's coordinates immediately (pan + pin)
5. Resolves to full `READY` state on `done`
6. Shows error recovery UI on `error`

### 3.9 Payments (Future — Milestone 3)

The credit system is wired in M2 (entitlement checks, credit debit, refund on failure) but Stripe integration is deferred to M3. During M2 development:
- Free tier users have a hardcoded credit balance for testing
- The `MembershipPlan`, `Subscription`, `CreditWallet`, and `CreditTransaction` tables are all in the schema and used by the credit service
- The entitlement check correctly evaluates both `balance` and `unlimitedCredits` — it will work transparently once M3 populates subscriptions via Stripe webhooks

### 3.10 Bookshop US Gating

Book recommendations are displayed only to users whose `countryCode === 'US'`. This business rule:
- Is enforced server-side via `lib/location/gate.ts → isUsUser(profile)`
- Is checked in Server Components and Route Handlers before returning any book recommendation content
- Is **never** client-side only
- Requires the structured location system (Phase 2 of this plan) to function
- The UI for book recommendations is gated in M2; the actual book content/integration is deferred

---

## 4. Development Order

Milestone 2 is divided into 8 phases. Each phase is independently testable and deployable. Later phases depend on earlier ones; this order is non-negotiable.

---

### Phase 1 — Schema Foundation

**Why first:** Every other phase touches the database. The schema must be correct before any code reads or writes it. Location fields are especially critical because they underpin Phase 2 (location system) which underlies Phase 7 (profile) and Phase 8 (bookshop gate). Indexes must be in place before data is written to avoid expensive backfills.

**Tasks:**
1. Add structured location fields to `Profile` model (`city`, `state`, `country`, `countryCode`, `formattedAddress`, `latitude`, `longitude`, `locationPlaceId`, `locationUpdatedAt`)
2. Add composite index `@@index([userId, status, updatedAt])` to `Journey`
3. Add composite index `@@index([userId, status, score])` to `DestinationRecommendation`
4. Add `@@index([countryCode])` to `Profile`
5. Run `prisma migrate dev` and `prisma generate`
6. Verify `prisma studio` shows new fields

**Exit criteria:** Schema migration applied cleanly; Prisma client regenerated; all existing pages still load without error.

---

### Phase 2 — Location Infrastructure

**Why second:** Location is an independent platform module that underpins AI reasoning, Bookshop gating, and future mobile features. It must be decoupled from the Profile system and strictly enforce server-side validation. We implement the entire location infrastructure (backend and frontend integration) before the AI pipeline so the AI can use validated user coordinates.

**Tasks:**
1. Create `src/lib/location/env.ts` — validates `GOOGLE_MAPS_API_KEY` at startup.
2. Create `src/lib/location/types.ts` — defines `UserLocation` and shared interfaces.
3. Create `src/lib/location/google.ts` — strictly HTTP communication with Google Places API (New).
4. Create `src/lib/location/parser.ts` — converts raw Google responses into the internal Wayheld `UserLocation` object.
5. Create `src/lib/location/validation.ts` — Zod schemas to sanitize strings, validate coordinates, and enforce ISO 3166-1 alpha-2 `countryCode`.
6. Create `src/lib/location/service.ts` — the main business logic and entry point for all features (e.g., `resolveLocation`, `autocompletePlaces`).
7. Create `src/lib/location/gate.ts` — `isUsUser(profile: { countryCode: string | null }): boolean`.
8. Create Maps proxy route handlers:
    - `GET /api/v1/maps/autocomplete` — proxies Places API Autocomplete (New), implements debounce/caching.
    - `GET /api/v1/maps/details/[placeId]` — proxies Place Details (New), returns structured fields.
    - `GET /api/v1/maps/reverse` — proxies Reverse Geocoding.
9. Create `src/components/location/LocationAutocomplete.tsx` — client component with debounced proxy calls.
10. Create `src/components/location/LocationDetect.tsx` — "Use my current location" browser API button.
11. Create `updateProfileLocation` Server Action in `src/actions/profile-actions.ts` — writes normalized location to `Profile`.
12. Modify `src/app/api/v1/auth/signup/route.ts` and `SignupForm.tsx` — add optional location field gracefully without adding friction.
13. Rebuild `src/app/(dashboard)/profile/page.tsx` — wire `LocationAutocomplete` and `LocationDetect` into the existing layout.

**Exit criteria:** The standalone location module successfully parses and validates Google Places API (New) responses. Maps proxy routes secure the API keys. Users can complete signup with an optional location, or update it later via the Profile page using manual search or auto-detection. `countryCode` is always strictly ISO 3166-1 alpha-2.

---

### Phase 3 — AI Pipeline (No UI)

**Why third:** The AI pipeline is the most complex server-side module. Building it before the UI means it can be tested via direct API calls and debugged without UI noise. The streaming format must be established before the client UI is built around it.

**Tasks:**
1. Create `lib/ai/prompts/journey-plan.ts` with `PROMPT_VERSION` constant — system prompt builder (pure function of user profile data). Must include persona instruction, user travel preferences, output JSON contract, and Wayheld editorial rules
2. Create `lib/ai/prompts/refinement.ts` — prompt builder for `JOURNEY_REFINEMENT`. Includes journey context + prior refinements as conversation history
3. Create `lib/ai/prompts/insight.ts` — prompt builder for `DESTINATION_INSIGHT`
4. Create `lib/ai/schemas/journey-output.ts` — Zod schema for Claude's complete itinerary output
5. Create `lib/ai/schemas/stop-output.ts` — Zod schema for individual stop validation
6. Create `lib/ai/client.ts` — Anthropic SDK singleton (moved from original Phase 2)
7. Create `lib/journeys/entitlement.ts` — credit/subscription gate before generation (moved from original Phase 2)
8. Create `lib/journeys/credit-service.ts` — atomic pre-auth, commit, and refund helpers (moved from original Phase 2)
9. Create `lib/journeys/journey-service.ts` — shared CRUD helpers (moved from original Phase 2)
10. Create `lib/ai/pipeline.ts` — full generation orchestrator (`generateJourney`, `refineJourney`, `generateInsight`)
11. Create `POST /api/v1/journeys/[id]/generate` — streaming route handler (calls pipeline, streams NDJSON)
12. Create `POST /api/v1/journeys/[id]/refine` — streaming route handler (calls pipeline, streams NDJSON)
13. Test generate endpoint with a dummy DRAFT journey record (manually inserted)

**Exit criteria:** `generate` endpoint streams valid NDJSON; stops are written to DB; `AiGeneration` record created with correct status, token counts, and cost; credit is debited atomically on success; a failed generation does not debit credit.

---

### Phase 4 — Journey CRUD + Infrastructure

**Why fourth:** The Journey Builder UI (Phase 5) needs real journey data to render. The CRUD route handlers, Zustand store, and the Journey list page must exist before the builder workspace. This phase also produces the paginated journeys list which is a standalone deliverable.

**Tasks:**
1. Create `GET /api/v1/journeys` — cursor-paginated list (status filter, `take: 20`, `deletedAt: null`)
2. Create `POST /api/v1/journeys` — creates a `DRAFT` journey (validates intent, does NOT generate)
3. Create `GET /api/v1/journeys/[id]` — returns journey + stops + refinements (ownership check)
4. Create `PATCH /api/v1/journeys/[id]` — update title, notes, params (ownership check, status guard)
5. Create `DELETE /api/v1/journeys/[id]` — soft delete (`deletedAt = now()`)
6. Create `GET /api/v1/journeys/[id]/refinements` — list refinement history
7. Create `GET /api/v1/credits` — returns balance, lifetime totals, recent transactions
8. Create `GET /api/v1/me` — returns user + profile + travel preferences
9. Create `useJourneyStore` Zustand store (`src/stores/journey-store.ts`): journey data, stops, refinements, stream status, streaming stops accumulator, map state, refine panel state, and all actions
10. Create `src/actions/journey-actions.ts` — Server Actions: `createJourney`, `updateJourney`, `deleteJourney`, `saveJourney`, `unsaveJourney`
11. Update `/journeys` page to fetch real data and render `JourneyCard` list with cursor pagination

**Exit criteria:** Journeys list page renders real data; journey can be created via API; Zustand store compiles and its types are correct.

---

### Phase 5 — Journey Builder Workspace

**Why fifth:** The Builder is the central UX of the entire product. It depends on Phases 2 (maps), 3 (AI pipeline), and 4 (CRUD + store). All sub-components of the Builder are created in this phase. The Builder must work inside the existing dashboard layout — it does not replace it.

**Tasks:**
1. Create `src/components/journey/JourneyCard.tsx` — list-view card (title, status badge, stops count, dates, thumbnail)
2. Create `src/components/journey/StopCard.tsx` — individual stop (name, description, nights, highlights, kind badge, save-place toggle)
3. Create `src/components/journey/ItineraryList.tsx` — ordered list of `StopCard`s; shows skeleton cards during streaming
4. Create `src/components/journey/GeneratingState.tsx` — "Wayheld is planning your journey..." animation
5. Create `src/components/journey/JourneyMap.tsx` — map panel (client component, `dynamic` import, `ssr: false`)
6. Create `src/components/journey/RefinementPanel.tsx` — collapsible panel: NL textarea + quick action chips
7. Create `src/components/journey/JourneyBuilder.tsx` — root builder client component. Initialises `useJourneyStore`, reads stream, composes panels
8. Create `src/components/journey/JourneyStatusBadge.tsx` — colour-coded status badge
9. Create `src/components/ui/ErrorBoundary.tsx` — per-widget error isolation
10. Create `src/components/ui/SkeletonCard.tsx` — reusable loading skeleton
11. Create `src/components/ui/StreamingProgress.tsx` — animated progress for streaming operations
12. Create `src/app/(dashboard)/journeys/[id]/page.tsx` — journey detail (read-only view for READY journeys)
13. Create `src/app/(dashboard)/journeys/[id]/build/page.tsx` — builder workspace
14. Rebuild `src/app/(dashboard)/journeys/new/page.tsx` — real form: destination input, optional dates, traveller count, budget selector, pace selector (pre-filled from profile preferences)

**Exit criteria:** Full journey creation → generation → READY flow works end-to-end. Map shows stops. Streaming renders stop cards progressively. Refine panel sends requests. Error states display correctly. Sidebar remains visible throughout.

---

### Phase 6 — Profile Preferences Update

**Why sixth:** Location tracking is already handled in Phase 2. This phase is exclusively for completing the profile functionality by hooking up the travel preferences editing and generic profile updates, preparing for dashboard enhancements.

**Tasks:**
1. Create `updatePreferences` Server Action in `src/actions/profile-actions.ts`
2. Create `PATCH /api/v1/me/profile` route handler — updates generic profile fields
3. Extend `getCachedProfile` in `session-cache.ts` to select all new location fields (added in Phase 1)
4. Add location display to `/settings` page (read-only `InfoCard` showing `formattedAddress`)

**Exit criteria:** Profile page settings and preferences save correctly. Settings page shows location information properly.

---

### Phase 7 — Saved Journeys + Saved Places + Explore

**Why seventh:** Saving functionality requires journeys to exist (Phase 5). The explore page requires the location system (Phase 6) because the bookshop gate depends on `countryCode`. Ordering these after core journey functionality means the save/explore flow can use real journeys.

**Tasks:**
1. Create `POST /api/v1/journeys/[id]/save` and `DELETE /api/v1/journeys/[id]/save`
2. Create `GET /api/v1/saved/journeys` — paginated saved journeys
3. Create `POST /api/v1/places/save` — creates `SavedPlace` (unique on `userId + googlePlaceId`)
4. Create `DELETE /api/v1/places/[id]`
5. Create `GET /api/v1/saved/places`
6. Create `GET /api/v1/recommendations` — applies `isUsUser()` gate server-side for book recommendations
7. Create `PATCH /api/v1/recommendations/[id]` — update status
8. Create `savePlace` and `unsavePlace` Server Actions in `src/actions/place-actions.ts`
9. Create `src/components/explore/PlaceCard.tsx` — recommendation card
10. Create `src/components/explore/ExploreGrid.tsx` — responsive grid with status filter tabs
11. Create `src/components/ui/Tabs.tsx` — accessible tab component
12. Create `src/app/(dashboard)/saved/page.tsx` — tabbed: Saved Journeys + Saved Places
13. Create `src/app/(dashboard)/saved/places/page.tsx` — saved places with mini map
14. Create `src/app/(dashboard)/explore/page.tsx` — recommendations feed; conditionally renders book-rec section only if `isUsUser(profile)`
15. Add "Explore" to sidebar `NAV_ITEMS`

**Exit criteria:** User can save and unsave journeys and places. Saved pages render correctly. Explore feed shows recommendations. Book recommendations appear only for users with `countryCode === 'US'`.

---

### Phase 8 — Dashboard Enhancement + Polish

**Why last:** The dashboard widgets require real data from all previous phases (journeys, credits, saved places, recommendations). Doing this last means widgets always show accurate, populated data.

**Tasks:**
1. Add "Continue Journey" widget — most recent `DRAFT` or `REFINING` journey with "Continue" CTA
2. Add "Your Journeys" widget — last 3 journeys with `JourneyCard` list; "View all" link
3. Wire credits balance widget to real `CreditWallet.balance`
4. Add recommendations teaser (2–3 recommendations with "Explore all" link)
5. Create `PATCH /api/v1/me/preferences` route handler
6. Implement settings preferences editing (replace `EmptyState` placeholder)
7. Create `src/components/ui/ConfirmDialog.tsx` — modal confirmation for destructive actions
8. Wrap all dashboard widgets in `<Suspense fallback={<SkeletonCard />}>` for independent loading
9. Wrap all dashboard widgets in `<ErrorBoundary>` for per-widget isolation
10. Add `JOURNEY_VIEWED` activity logging when a journey detail page is loaded
11. Final audit: no `NEXT_PUBLIC_` API keys in bundle; all pages load in production build; sidebar nav works for all new pages

**Exit criteria:** Dashboard home page shows real data for all widgets. Continue Journey widget appears when a DRAFT or REFINING journey exists. Settings preference editor saves correctly. No widget crashes the entire page.

---

## 5. Feature Dependency Graph

```
Phase 1: Schema Foundation
│
├── Phase 2: Server Infrastructure (AI + Maps)
│   ├── lib/ai/client.ts
│   ├── lib/maps/client.ts
│   ├── lib/location/gate.ts ────── isUsUser() — all US gating flows through here
│   ├── lib/journeys/entitlement.ts
│   └── /api/v1/maps/* proxy routes
│       │
│       ├── Phase 3: AI Pipeline
│       │   ├── lib/ai/prompts/*
│       │   ├── lib/ai/schemas/*
│       │   ├── lib/ai/pipeline.ts
│       │   ├── /api/v1/journeys/[id]/generate
│       │   └── /api/v1/journeys/[id]/refine
│       │       │
│       │       └── Phase 5: Journey Builder UI
│       │           ├── JourneyBuilder.tsx (Zustand store)
│       │           ├── ItineraryList + StopCard
│       │           ├── JourneyMap
│       │           └── /journeys/[id]/build page
│       │
│       └── Phase 6: Profile + Location System
│           ├── LocationAutocomplete.tsx
│           ├── LocationDetect.tsx
│           ├── Profile page rebuild
│           └── Profile.countryCode populated
│               │
│               └── Phase 7: Explore (Bookshop Gate)
│                   ├── isUsUser(profile) applied server-side
│                   └── Book recs only shown if countryCode === 'US'
│
├── Phase 4: Journey CRUD + useJourneyStore
│   ├── /api/v1/journeys (list, create, detail, update, delete)
│   ├── useJourneyStore Zustand store
│   ├── /journeys page with real data
│   └── /journeys/new form
│       │
│       └── Phase 5: Journey Builder UI (also depends on Phase 3)
│
└── Phase 7: Saves + Explore (depends on Phase 5 + Phase 6)
    ├── /saved, /saved/places, /explore pages
    └── Save/unsave Server Actions
        │
        └── Phase 8: Dashboard Enhancement
            ├── Continue Journey widget ← Phase 4
            ├── Credits pill ← Phase 2
            ├── Saved places count ← Phase 7
            └── Recommendations teaser ← Phase 7

Specific chain for US Bookshop Gate:
  Profile Location set by user (Phase 6)
    → countryCode stored and server-verified
    → isUsUser() returns true/false
    → Explore page book-rec section conditionally rendered
    → /api/v1/recommendations filters book recs server-side

Specific chain for AI Generation:
  Journey DRAFT created (Phase 4)
    → Entitlement check passes (Phase 2)
    → AI Generation triggered (Phase 3)
    → Stops stream to browser (Phase 3 + 5)
    → Credit debited atomically (Phase 3)
    → Refinement available (Phase 3 + 5)
    → Journey saved (Phase 7)

User Preferences from onboarding (M1):
  → Journey form pre-fill (Phase 5)
  → AI system prompt injection (Phase 3)
  → Personalised itinerary output
```

---

## 6. Journey Builder UX

### 6.1 Layout Principle

> **The existing dashboard layout must not be disturbed.** The left sidebar remains visible at all times. The Journey Builder opens inside the main content area of the dashboard, not as a full-screen overlay or application takeover.

The `DashboardShell` and `Sidebar` components from Milestone 1 are preserved unchanged. The Journey Builder renders inside the `{children}` slot of `DashboardLayout`. This is non-negotiable.

### 6.2 Journey Creation (`/journeys/new`)

The page renders inside the dashboard with the sidebar visible. The current placeholder stub is replaced with a real form.

**Form fields:**

| Field | Input type | Default |
|---|---|---|
| Destination / region | Text input (free text) | Empty |
| Start date | Date picker (optional) | Empty |
| End date | Date picker (optional) | Empty |
| Traveller count | Number stepper (1–12) | 1 |
| Budget | Single-select chip row (Modest / Comfortable / Premium / Luxury) | Pre-filled from `TravelPreference.budget` |
| Pace | Single-select chip row (One Place Deeply / Slow & Unhurried / Gently Balanced) | Pre-filled from `TravelPreference.pace` |

**Submit behaviour:**
1. Client-side validation (destination required; end date ≥ start date if both provided)
2. Server Action `createJourney` creates a `DRAFT` `Journey` record
3. Redirect to `/journeys/[id]/build`

**Design rule:** Reuse `formStyles.input`, `formStyles.label`, `buttonStyles.primary`, and `optionCard()` from `lib/design.ts`. No new CSS tokens.

### 6.3 Builder Workspace (`/journeys/[id]/build`)

Three-panel layout inside the dashboard shell:

```
┌──────────────────────────────────────────────────────────────────┐
│  SIDEBAR (existing, unchanged — 240px fixed left column)        │
├────────────────────────────┬─────────────────────────────────────┤
│                            │                                     │
│   ITINERARY PANEL (~40%)  │   MAP PANEL (~60%)                  │
│                            │                                     │
│   Journey title            │   Interactive Google Map            │
│   Status badge             │   Stop pins (numbered)              │
│   Credit cost / "included" │   Selected stop highlighted         │
│   [Generate Itinerary] CTA │   Auto-framed to boundingBox        │
│                            │                                     │
│   (after READY:)           │                                     │
│   Stop 1 card              │                                     │
│   Stop 2 card              │                                     │
│   Stop 3 card              │                                     │
│   ...                      │                                     │
│                            │                                     │
│   [Refine Journey] button  │                                     │
├────────────────────────────┴─────────────────────────────────────┤
│   REFINEMENT PANEL (collapsible, slides up from bottom)         │
│   Textarea: "Tell Wayheld how to adjust this journey..."        │
│   Chips: [Slower pace] [Add days] [Remove a stop] [Avoid crowds]│
│   [Submit refinement]                                           │
└──────────────────────────────────────────────────────────────────┘
```

**Mobile layout (breakpoint < lg):**
Stacked tab navigation: `Itinerary | Map | Refine`. Each tab shows its respective panel full-width. The existing `MobileHeader` component remains at the top.

### 6.4 Journey States in the Builder

| Status | Itinerary Panel | Map Panel | Available Actions |
|---|---|---|---|
| `DRAFT` | Empty state with [Generate Itinerary] CTA; credit cost shown | Empty / destination centred | Generate |
| `GENERATING` | `GeneratingState` component — animated "Wayheld is planning..." | Stop pins appear progressively as coordinates arrive | None (cancel: future) |
| `READY` | Full `StopCard` list | All stops pinned; bounds auto-framed | Refine, Save Journey |
| `REFINING` | Existing stops shown, dimmed; "Adjusting..." indicator | Existing stops, normal display | None |
| `FAILED` | Error card with message; [Try Again] button | Previous state or empty | Retry (resets to DRAFT) |
| `ARCHIVED` | Read-only itinerary; "Archived" banner | Stops shown, read-only | Restore (future) |

### 6.5 Stop Cards

Each `StopCard` displays:
- Stop kind badge (`surfaces.chip` — City / Village / Nature / Heritage Site / etc.)
- Stop name (prominent, `font-display`)
- Day range (e.g. "Days 1–3") and nights ("2 nights")
- Short description (2–3 sentences, editorial voice)
- Highlights list (up to 5 bullets)
- "Save this place" heart toggle → creates `SavedPlace` via Server Action (optimistic, rollback on error)
- Click interaction → selects stop on map (pan + highlight pin)

Design: `surfaces.card` for container, `surfaces.chip` for kind badge, `buttonStyles.ghost` for save toggle. No new design tokens.

### 6.6 Refinement Panel

- Collapsible with `motion` animation (installed; used in onboarding)
- Natural language textarea: "Tell Wayheld how to adjust this journey..."
- Quick-action chips mapping to `RefinementType` enum values:
  - [Slower pace] → `PACE_CHANGE`
  - [Add more days] → `DATE_CHANGE`
  - [Remove a stop] → `REMOVE_STOP`
  - [Avoid crowds] → `AVOID_CROWDS`
  - [Reorder stops] → `REORDER`
  - [Change budget] → `BUDGET_CHANGE`
- Submit: `POST /api/v1/journeys/[id]/refine` with `{ type, instruction, params }`
- Stream response handled by `useJourneyStore` — same streaming consumer as generate

### 6.7 Reuse of Existing M1 Components

| Existing component | Where reused in M2 |
|---|---|
| `PageHeader` | Journey Builder page header (eyebrow, title, back link) |
| `EmptyState` | DRAFT state of builder (before generate) |
| `DashboardShell` + `Sidebar` | Unchanged; wraps all builder pages |
| `MobileHeader` | Unchanged; mobile builder top bar |
| `buttonStyles.primary` | Generate, Submit refinement |
| `buttonStyles.secondary` | Cancel, Archive |
| `buttonStyles.ghost` | Save place toggle, secondary actions |
| `formStyles.input` | Refinement textarea, destination input |
| `formStyles.label` | All form labels |
| `optionCard()` | Budget and pace selectors in `/journeys/new` |
| `surfaces.card` | `StopCard` container, `JourneyCard` container |
| `surfaces.chip` | Stop kind badge, quick-action chips |
| `riseVariants` + `containerVariants` | Stop card reveal animations |
| `getCachedSession` + `getCachedProfile` | Auth + profile data in all new pages |

---

## 7. Location Strategy

### 7.1 Why Location Is Required

Location enables three things in Wayheld:

1. **AI personalisation** — The user's home city is included in the Claude system prompt for distance and feasibility reasoning ("from Pakistan, a flight to Japan for 10 days is realistic; a weekend in Paris is not").
2. **Bookshop US gate** — Book recommendations are a US-only feature enforced server-side via `countryCode`.
3. **Future proximity features** — Explore recommendations and saved places can eventually be filtered by proximity to the user's home location.

### 7.2 Data Model

**Fields added to `Profile` in Phase 1 schema migration:**

| Field | Type | Description |
|---|---|---|
| `city` | `String?` | City name from Google `address_components` |
| `state` | `String?` | State/province from Google `address_components` |
| `country` | `String?` | Full country name from Google `address_components` |
| `countryCode` | `String?` | **ISO 3166-1 alpha-2** (e.g. `"US"`, `"GB"`). Source of truth for all gating. |
| `formattedAddress` | `String?` | Full formatted address string from Google (e.g. `"London, UK"`) |
| `latitude` | `Float?` | Geographic latitude |
| `longitude` | `Float?` | Geographic longitude |
| `locationPlaceId` | `String?` | Google Place ID |
| `locationUpdatedAt` | `DateTime?` | When location was last set |

**Kept without change:**
- `homeCity` — legacy freetext; display fallback if structured location is null
- `homeCountry` — legacy freetext; same purpose

### 7.3 Collection Points

**A. Post-onboarding dashboard prompt (recommended)**

After first completing onboarding, the dashboard shows a dismissible card: "To personalise your journeys, tell us where you're based." [Set my location] [Maybe later]. Lower friction than a blocking onboarding step, higher completion because the user has already invested in onboarding.

**B. Profile page (ongoing)**

The rebuilt Profile page includes a Location section that users can update at any time.

### 7.4 Browser Geolocation Flow

```
User clicks "Use my current location"
  → navigator.geolocation.getCurrentPosition()
      ↓ granted
      → GET /api/v1/maps/reverse?lat={lat}&lng={lng}
        → Server calls Google Geocoding API
        → Extracts: city, state, country, countryCode, formattedAddress, placeId
        → Returns UserLocation to client
      → Client calls updateProfile Server Action
      → Profile updated; page revalidated
      ↓ denied
      → Show LocationAutocomplete input (manual fallback)
```

### 7.5 Google Places Autocomplete Flow

```
User types in LocationAutocomplete input
  → Debounce 300ms
  → GET /api/v1/maps/autocomplete?q={input}&sessiontoken={uuid}
    → Server adds GOOGLE_MAPS_API_KEY
    → Returns: [{ placeId, description, mainText, secondaryText }]
  → Client renders dropdown

User selects a prediction
  → GET /api/v1/maps/details/{placeId}
    → Server calls Google Place Details API
    → Parses address_components:
        city          ← locality, long_name
        state         ← administrative_area_level_1, long_name
        country       ← country, long_name
        countryCode   ← country, short_name   ← ISO 3166-1 alpha-2
        latitude      ← geometry.location.lat
        longitude     ← geometry.location.lng
        formattedAddress ← formatted_address
    → Returns UserLocation
  → Client emits onSelect(UserLocation)
  → Parent calls updateProfile Server Action
```

### 7.6 Server-Side Validation Rule

> `countryCode` is **never** trusted from client submission. The server proxy extracts it from Google's `address_components`. When saving location, the server receives a `placeId`, calls Google Place Details, and extracts `countryCode` from the verified response. A client submitting `countryCode = 'US'` directly is ignored.

### 7.7 US Bookshop Gate

```typescript
// lib/location/gate.ts
export function isUsUser(profile: { countryCode: string | null }): boolean {
  return profile.countryCode === 'US';
}
```

**Server Component usage:**
```typescript
const profile = await getCachedProfile(session.user.id);
const showBooks = isUsUser(profile);
// Pass showBooks as a prop to client components; never perform this check client-side
```

**Route Handler usage:**
```typescript
const profile = await prisma.profile.findUnique({ where: { userId }, select: { countryCode: true } });
if (isUsUser(profile)) {
  // Include book recommendations in response
}
```

**Critical rule:** This check must appear in the server layer first and always. Client-side checks are supplementary display logic only.

### 7.8 getCachedProfile Extension

After Phase 1 (schema migration), the `select` list in `getCachedProfile` must include:

```typescript
city: true,
state: true,
country: true,
countryCode: true,
formattedAddress: true,
latitude: true,
longitude: true,
locationPlaceId: true,
locationUpdatedAt: true,
```

This adds negligible query cost and makes location data available to all 5+ pages that already call `getCachedProfile`.

---

## 8. AI Layer

### 8.1 Philosophy (Enforced in Every Prompt)

> Wayheld is not ChatGPT. The AI is not a travel agent and not a search engine. It is an experienced slow traveller who has lived in many places and recommends from lived experience.

System prompt persona: "You are a seasoned slow traveller. You have spent months in most of the places you recommend. You do not give tourist itineraries. You give the kind of advice a well-travelled friend would give."

Rules encoded in the system prompt:
- No tourist traps; no famous-because-famous recommendations
- Prefer local, independent, small-scale, regenerative
- Respect the user's stated pace — `ONE_PLACE_DEEPLY` means fewer stops and deeper immersion
- Output: structured JSON only; no prose outside the schema; no preambles or apologies

### 8.2 Claude Client

**`lib/ai/client.ts`** — singleton pattern mirroring `lib/db.ts`:
- Imports Anthropic SDK
- Creates single `Anthropic` instance cached on `globalThis` in development
- Exports as `anthropic`
- Server-only module (never importable in client components)
- Uses `ANTHROPIC_API_KEY` env var

### 8.3 Prompt Architecture

**`lib/ai/prompts/journey-plan.ts`**

Function: `buildJourneyPlanPrompt(input: JourneyPlanInput): { system: string, messages: MessageParam[] }`

Input shape:
```typescript
{
  destination: string           // User's originQuery
  durationDays: number | null   // From journey params
  startDate: Date | null
  travelerCount: number
  profile: {
    pace: TravelPace
    budget: BudgetTier
    transport: TransportPreference
    avoidCrowds: boolean
    interests: string[]         // Interest slugs
    travelStyle: string | null  // TravelStyle slug
    homeCity: string | null     // For distance reasoning
  }
}
```

The `system` string is a constant tagged with `PROMPT_VERSION = 'journey-plan-v1'`. This version string is stored in `AiGeneration.model` as `"claude-3-5-sonnet-20241022|journey-plan-v1"`.

**`lib/ai/prompts/refinement.ts`**

Function: `buildRefinementPrompt(input: RefinementInput): { system: string, messages: MessageParam[] }`

Reconstructs conversation history from `JourneyRefinement` records. Includes last N=5 prior refinements as alternating user/assistant turns.

### 8.4 Output Validation (Zod)

**`lib/ai/schemas/journey-output.ts`**:

```typescript
const LatLngSchema = z.object({ lat: z.number(), lng: z.number() });

const StopSchema = z.object({
  order: z.number().int().min(1),
  kind: z.enum(['CITY','TOWN','VILLAGE','NATURE','HERITAGE_SITE','STAY','EXPERIENCE','TRANSIT','MEAL']),
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(600),
  nights: z.number().int().min(0).optional(),
  dayStart: z.number().int().min(1).optional(),
  dayEnd: z.number().int().min(1).optional(),
  highlights: z.array(z.string().max(120)).max(5),
  searchQuery: z.string().min(1).max(200)
});

const JourneyPlanSchema = z.object({
  title: z.string().min(3).max(120),
  summary: z.string().min(20).max(500),
  durationDays: z.number().int().min(1).max(90),
  primaryCountry: z.string().min(1),
  region: z.string().optional(),
  boundingBox: z.object({ ne: LatLngSchema, sw: LatLngSchema }),
  stops: z.array(StopSchema).min(1).max(15)
});
```

**Rule:** If `JourneyPlanSchema.parse()` throws: `AiGeneration.status = FAILED`, `Journey.status = FAILED`, no credit debit, error event emitted to stream.

### 8.5 Pipeline Execution Order (generateJourney)

```
1. Fetch journey from DB (verify ownership, verify status === 'DRAFT')
2. Fetch user profile + preferences
3. Run entitlement check
   → If insufficient: yield error event, return
4. BEGIN TRANSACTION
   - Create AiGeneration record (status = QUEUED)
   - Set Journey.status = GENERATING
   COMMIT
5. Build system + user prompt
6. Log system + user messages as AiPromptLog rows
7. Call anthropic.messages.stream()
8. Accumulate streamed text; extract stops progressively
   → For each parseable stop: resolve Google Place → yield {"type":"stop",...} to client
9. When stream completes:
   a. Parse full output with JourneyPlanSchema
      → On failure: FAILED path
   b. BEGIN TRANSACTION
      - Create all JourneyStop rows
      - Update AiGeneration (COMPLETED, tokens, cost, latency, output)
      - Create CreditTransaction CONSUMPTION
      - Update CreditWallet (balance--)
      - Set Journey.status = READY, version++
      COMMIT
   c. Log assistant response as AiPromptLog
   d. Create JOURNEY_READY Notification
10. Yield {"type":"done",...}

On any error after step 4:
- Set AiGeneration.status = FAILED
- Set Journey.status = FAILED
- If credit was pre-authorised: CREATE CreditTransaction REFUND
- Create JOURNEY_FAILED Notification
- Yield {"type":"error",...}
```

### 8.6 Streaming Format (NDJSON)

```
Content-Type: application/x-ndjson

{"type":"start","journeyId":"clxyz123"}
{"type":"meta","title":"Slow through the Alentejo","summary":"...","durationDays":7}
{"type":"stop","order":1,"name":"Évora","kind":"CITY","description":"...","nights":2,"dayStart":1,"dayEnd":2,"highlights":["..."],"latitude":38.571,"longitude":-7.908}
{"type":"stop","order":2,"name":"Monsaraz","kind":"VILLAGE","description":"...","nights":1,...}
{"type":"done","status":"READY","stopsCount":4,"version":1}
```

Error format:
```
{"type":"error","code":"GENERATION_FAILED","message":"An error occurred. No credit was charged."}
```

**Format rule:** NDJSON via `ReadableStream` + `TextEncoder`. NOT Server-Sent Events. NOT `response.json()`. The client reads with `ReadableStreamDefaultReader` and parses each line as JSON.

### 8.7 Refinement Context Window

The refinement prompt reconstructs conversation history from `JourneyRefinement` records:

```
System: [same persona as journey plan]
User: [original destination + params]
Assistant: [original itinerary as JSON]
User: [refinement instruction 1]     ← JourneyRefinement[0].instruction
Assistant: [result of refinement 1]  ← stops snapshot
...up to N=5 prior refinements...
User: [new refinement instruction]   ← current request
```

### 8.8 Error Handling

| Error type | Server response | Credit | User message |
|---|---|---|---|
| Zod parse failure | `FAILED` | No charge | "We couldn't generate a valid itinerary. Please try again — no credit was charged." |
| Anthropic API 5xx | `FAILED` | No charge (refund if pre-auth) | "Wayheld couldn't reach the AI right now. Try again in a moment." |
| Timeout | `FAILED` | No charge | "Generation took too long. Please try again." |
| Not owner | 403 immediately | No charge | "This journey doesn't belong to your account." |
| Already GENERATING | 409 immediately | No charge | "Your journey is already being generated." |
| Insufficient credits | 402 immediately | No charge | "You've used your available credits. Upgrade to continue." |

### 8.9 Prompt Versioning

```
AiGeneration.model = "{ANTHROPIC_MODEL}|{PROMPT_VERSION}"
Example: "claude-3-5-sonnet-20241022|journey-plan-v1"
```

When a prompt is updated: increment the suffix (`v1` → `v2`). This enables quality analytics across prompt versions.

### 8.10 Cost Governance

Before every Claude call:
1. Check `CreditWallet.balance >= 1` OR `Subscription.unlimitedCredits = true`
2. Check daily call count per user against `MAX_AI_CALLS_PER_DAY` env var (default: 10)
3. Record exact `inputTokens` and `outputTokens` after completion
4. Compute and store `costMicroUsd = (tokens × rate) × 1000`

---

## 9. Database Changes

> **Documentation only. No migrations created here.**

### 9.1 Required Changes (Phase 1)

**`model Profile` — add structured location fields:**

```prisma
city              String?
state             String?
country           String?
countryCode       String?    // ISO 3166-1 alpha-2. Source of truth for gating.
formattedAddress  String?    // Full resolved address (e.g. "London, UK")
latitude          Float?
longitude         Float?
locationPlaceId   String?    // Google Place ID
locationUpdatedAt DateTime?  // Audit trail for location changes
```

**Rationale:** The existing `homeCity`/`homeCountry` free-text fields cannot be used for the US book recommendations gate — they are unstructured and unverified. Structured fields extracted from Google Place Details provide an authoritative, server-verified `countryCode`. The existing fields are kept as display fallbacks.

**`model Journey` — add composite index:**

```prisma
@@index([userId, status, updatedAt])
```

**Rationale:** The dashboard "Continue Journey" widget queries for the most recent `DRAFT` or `REFINING` journey per user. Without this index, the query scans all user journeys sorted by `updatedAt`. With this index, it is a single B-tree lookup.

**`model DestinationRecommendation` — add composite index:**

```prisma
@@index([userId, status, score])
```

**Rationale:** The explore feed queries recommendations sorted by score, filtered by status per user. This index makes that query efficient.

**`model Profile` — add single-column index:**

```prisma
@@index([countryCode])
```

**Rationale:** Future admin analytics and potential geo-filtering will query by country code. This index makes that O(log n).

### 9.2 No Other Schema Changes Required

All M2 features are fully supported by the existing schema:

| Model | M2 use | Status |
|---|---|---|
| `Journey` | Create, generate, refine, list, archive | ✅ Ready |
| `JourneyStop` | Created by AI pipeline | ✅ Ready |
| `JourneyRefinement` | Immutable refinement history | ✅ Ready |
| `AiGeneration` | One record per Claude call | ✅ Ready |
| `AiPromptLog` | Raw turns per generation | ✅ Ready |
| `CreditWallet` | Balance read + debit | ✅ Ready |
| `CreditTransaction` | Append-only ledger | ✅ Ready |
| `SavedJourney` | User journey bookmarks | ✅ Ready |
| `SavedPlace` | User place bookmarks | ✅ Ready |
| `DestinationRecommendation` | Explore feed | ✅ Ready |
| `UserActivity` | Event logging | ✅ Ready |
| `Notification` | Journey ready/failed alerts | ✅ Ready |

### 9.3 Future Schema Changes (Not in M2)

| Change | Milestone | Reason |
|---|---|---|
| `Journey.visibility` enum | M3+ | Sharing feature |
| `Journey.shareToken` field | M3+ | Public share links |
| `Device` model with `pushToken` | M4+ | Mobile push notifications |
| PostGIS `geography` column on `JourneyStop` | M4+ | Radius search |

---

## 10. Route Structure

> **Documentation only. No implementation.**

All routes are under `/api/v1/` for mobile compatibility.

### 10.1 Auth (existing — M1)

```
POST   /api/v1/auth/signup
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/verify-email
GET/POST /api/auth/[...nextauth]
```

### 10.2 Onboarding (existing — M1)

```
GET    /api/v1/onboarding
PATCH  /api/v1/onboarding
POST   /api/v1/onboarding
```

### 10.3 Maps Proxy (Phase 2 — NEW)

```
GET    /api/v1/maps/autocomplete?q={input}&sessiontoken={token}
       Returns: { predictions: [{ placeId, description, mainText, secondaryText }] }

GET    /api/v1/maps/details/[placeId]
       Returns: { placeId, formattedAddress, city, state, country, countryCode, latitude, longitude }

GET    /api/v1/maps/reverse?lat={lat}&lng={lng}
       Returns: same shape as /details/[placeId]
```

### 10.4 Journeys (Phase 4 — NEW)

```
GET    /api/v1/journeys?status={status}&cursor={cursor}&take={take}
       Returns: { items: Journey[], nextCursor: string | null }

POST   /api/v1/journeys
       Body: { originQuery, startDate?, endDate?, travelerCount?, budget?, pace? }
       Returns: { journey: Journey }

GET    /api/v1/journeys/[id]
       Returns: { journey, stops: JourneyStop[], refinements: JourneyRefinement[] }

PATCH  /api/v1/journeys/[id]
       Body: { title?, status?, originQuery?, startDate?, endDate? }
       Returns: { journey }

DELETE /api/v1/journeys/[id]
       Returns: { ok: true }

GET    /api/v1/journeys/[id]/refinements
       Returns: { items: JourneyRefinement[] }
```

### 10.5 AI Generation (Phase 3 — NEW)

```
POST   /api/v1/journeys/[id]/generate
       Requires: Journey.status === 'DRAFT'
       Streams: NDJSON (start, meta, stop×N, done | error)
       On success: Journey.status → READY; credit debited

POST   /api/v1/journeys/[id]/refine
       Body: { type: RefinementType, instruction?: string, params?: object }
       Requires: Journey.status === 'READY'
       Streams: NDJSON (start, stop×N, done | error)
       On success: Journey.status → READY; JourneyRefinement created; version++
```

### 10.6 Saves (Phase 7 — NEW)

```
POST   /api/v1/journeys/[id]/save
DELETE /api/v1/journeys/[id]/save
GET    /api/v1/saved/journeys?cursor={cursor}

POST   /api/v1/places/save
       Body: { googlePlaceId, kind, name, latitude, longitude, country?, imageUrl?, note? }
DELETE /api/v1/places/[id]
GET    /api/v1/saved/places
```

### 10.7 Profile and Account (Phase 6 — NEW)

```
GET    /api/v1/me
       Returns: { user, profile, preferences }

PATCH  /api/v1/me/profile
       Body: { firstName?, lastName?, bio?, ... }
       Returns: { profile }

PATCH  /api/v1/me/location
       Body: { placeId: string }
       Server re-verifies all structured fields via Google API
       Returns: { ok: true, location: UserLocation }

PATCH  /api/v1/me/preferences
       Body: { pace?, transport?, budget?, avoidCrowds?, ... }
       Returns: { preferences }

POST   /api/v1/me/password
       Body: { currentPassword, newPassword }
       Returns: { ok: true }
```

### 10.8 Credits (Phase 2/4 — NEW)

```
GET    /api/v1/credits
       Returns: { balance, lifetimeGranted, lifetimeConsumed, transactions: CreditTransaction[] }
```

### 10.9 Recommendations (Phase 7 — NEW)

```
GET    /api/v1/recommendations?status={status}&cursor={cursor}
       Applies isUsUser() gate server-side
       Returns: { items: DestinationRecommendation[], nextCursor }

PATCH  /api/v1/recommendations/[id]
       Body: { status: 'VIEWED' | 'SAVED' | 'DISMISSED' }
       Returns: { recommendation }
```

### 10.10 Error Response Envelope

```typescript
// Success
{ ok: true, data?: T }

// Error
{
  error: {
    code: string,
    message: string,
    fields?: Record<string, string>
  }
}
```

**HTTP status codes:** `200` read success · `201` created · `400` bad request · `401` unauthenticated · `402` payment required (insufficient credits) · `403` forbidden (not owner) · `404` not found · `409` conflict (wrong status) · `422` validation failure · `429` rate limited · `500` server error (no stack trace exposed)

---

## 11. Shared Components

### 11.1 Journey (`src/components/journey/`)

| Component | Type | Description |
|---|---|---|
| `JourneyCard.tsx` | Client | List/grid card: title, status badge, date range, stops count, thumbnail. Links to `/journeys/[id]/build` |
| `JourneyBuilder.tsx` | Client | Root builder workspace. Initialises `useJourneyStore`, reads stream, composes panels |
| `ItineraryList.tsx` | Client | Ordered list of `StopCard`s; skeleton during streaming |
| `StopCard.tsx` | Client | Stop detail: kind badge, name, day range, description, highlights, save toggle |
| `GeneratingState.tsx` | Client | Animated loading while `streamStatus === 'generating'` |
| `JourneyMap.tsx` | Client | Google Maps panel (dynamic, `ssr: false`). Stop pins, selection, bounds |
| `RefinementPanel.tsx` | Client | Collapsible: NL textarea + quick-action chips + submit |
| `JourneyStatusBadge.tsx` | Client | Colour-coded status pill |

### 11.2 Location (`src/components/location/`)

| Component | Type | Description |
|---|---|---|
| `LocationAutocomplete.tsx` | Client | Debounced autocomplete input; emits `onSelect(UserLocation)` |
| `LocationDetect.tsx` | Client | Browser geolocation button with autocomplete fallback |

### 11.3 Explore (`src/components/explore/`)

| Component | Type | Description |
|---|---|---|
| `PlaceCard.tsx` | Client | Recommendation card: image, title, region, reason, score, save/dismiss actions |
| `ExploreGrid.tsx` | Client | Responsive grid with status filter tabs |

### 11.4 UI Primitives (`src/components/ui/`)

| Component | Type | Description |
|---|---|---|
| `ErrorBoundary.tsx` | Client | React error boundary; inline error + retry button |
| `SkeletonCard.tsx` | Client | Shimmer skeleton for loading states |
| `StreamingProgress.tsx` | Client | Animated progress indicator for streaming |
| `Tabs.tsx` | Client | Accessible tab component (saved journeys / saved places) |
| `ConfirmDialog.tsx` | Client | Modal confirmation for destructive actions |

### 11.5 Zustand Stores (`src/stores/`)

| Store | Description |
|---|---|
| `journey-store.ts` | Builder workspace state: journey data, stops, refinements, stream status, streaming stops, map state, refine panel state, and all actions (`setJourney`, `startStream`, `appendStreamingStop`, `commitStream`, `failStream`, `selectStop`, `setRefinePanelOpen`, `reset`) |

### 11.6 Server Actions (`src/actions/`)

| File | Actions |
|---|---|
| `journey-actions.ts` | `createJourney`, `updateJourney`, `deleteJourney`, `saveJourney`, `unsaveJourney` |
| `place-actions.ts` | `savePlace`, `unsavePlace` |
| `profile-actions.ts` | `updateProfile`, `updatePreferences` |
| `notification-actions.ts` | `markNotificationRead`, `markAllRead` |

---

## 12. Performance Strategy

### 12.1 Server vs. Client Rendering

| Page | Strategy | Reason |
|---|---|---|
| `/journeys` list | Server Component | Static list; no real-time state |
| `/journeys/new` | Server (shell) + Client (form) | Prefs preloaded; form is interactive |
| `/journeys/[id]/build` | Server (data) + Client (builder) | Initial fetch on server; map + stream are client-only |
| `/saved` | Server Component | Static list; revalidated on save/unsave |
| `/saved/places` | Server + Client (map) | Places list on server; map is client |
| `/explore` | Server + Client (map) | Recommendations on server; map is client |
| `/profile` | Server (shell) + Client (autocomplete form) | Autocomplete must be client |
| `/dashboard` | Server Component | Parallel data fetches; no real-time state |

### 12.2 React cache() Deduplication

```
getCachedSession()           — existing; deduplicates auth() call
getCachedProfile(userId)     — existing; extend to include location fields
getCachedPreferences(userId) — existing
getCachedJourney(id, userId) — NEW: for builder page (journey + ownership in one query)
```

### 12.3 Parallel Data Fetching

Use `Promise.all` for all multi-query pages:

```typescript
// Dashboard example
const [profile, wallet, journeyCount, recentJourneys] = await Promise.all([
  getCachedProfile(userId),
  prisma.creditWallet.findUnique({ where: { userId }, select: { balance: true } }),
  prisma.journey.count({ where: { userId, deletedAt: null } }),
  prisma.journey.findMany({ where: { userId, deletedAt: null }, take: 3, orderBy: { updatedAt: 'desc' } })
]);
```

### 12.4 Dynamic Imports

```typescript
// JourneyMap — heavy; SSR-incompatible
const JourneyMap = dynamic(() => import('@/components/journey/JourneyMap'), {
  ssr: false,
  loading: () => <SkeletonCard className="h-full" />
});
```

Google Maps JS script loaded once at the dashboard layout level via `useLoadScript` in `DashboardShell` (not per-page).

### 12.5 Maps API Caching

| Route | Cache TTL |
|---|---|
| `/api/v1/maps/autocomplete` | 5 minutes (LRU in-memory) |
| `/api/v1/maps/details/[placeId]` | 24 hours (places rarely change) |
| `/api/v1/maps/reverse` | 1 hour |

### 12.6 Cursor Pagination

All list queries use cursor pagination:

```typescript
const items = await prisma.journey.findMany({
  where: { userId, deletedAt: null, ...(cursor ? { id: { lt: cursor } } : {}) },
  take: 21,  // Fetch one extra to determine nextCursor
  orderBy: { createdAt: 'desc' }
});
const nextCursor = items.length > 20 ? items[20].id : null;
return { items: items.slice(0, 20), nextCursor };
```

**Rule:** Never use `findMany` without `take`. Never use `skip`-based pagination.

### 12.7 Loading States

Every data-dependent section has its own loading skeleton via `<Suspense>`:

```tsx
<Suspense fallback={<SkeletonCard />}>
  <ContinueJourneyWidget userId={userId} />
</Suspense>
```

Dashboard shell appears instantly; widgets hydrate independently.

### 12.8 Streaming UX Performance

- `GeneratingState` shown immediately on stream start — before any stops arrive
- Stop cards animate in with `riseVariants` as each JSON chunk is parsed
- Map pans to each stop's coordinates as they arrive (progressive reveal, not wait-for-all)

### 12.9 Image Optimisation

Journey and stop images from Google Places use `next/image` with `remotePatterns` configured for `maps.googleapis.com`. Never use plain `<img>` tags.

### 12.10 Bundle Splitting

- `JourneyMap` — dynamic import prevents Google Maps JS from loading on non-builder pages
- `@react-google-maps/api` — imported only in map-related components
- `motion` — already installed; confirm it is not duplicated across components

---

## 13. Security

### 13.1 Ownership Validation

Every route handler that accesses a specific journey must use `assertJourneyOwner` from `lib/journeys/journey-service.ts`:

```typescript
async function assertJourneyOwner(journeyId: string, userId: string): Promise<Journey> {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId, deletedAt: null }
  });
  if (!journey) throw new NotFoundError('Journey not found');
  if (journey.userId !== userId) throw new ForbiddenError('Access denied');
  return journey;
}
```

This is called first in every journey route handler, before any other logic.

### 13.2 Prompt Injection Prevention

User content included in Claude prompts:

| Field | Limit | Sanitisation |
|---|---|---|
| `originQuery` | 200 chars | Strip HTML; reject strings matching `/ignore.*instructions|you are now/i` |
| Refinement `instruction` | 500 chars | Same |
| Profile `firstName` | 60 chars | Strip HTML |

**Rule:** User content is always placed in the `user` message role. The `system` message is a static constant — never dynamically composed from user input.

### 13.3 API Key Security

| Key | Env var | Rule |
|---|---|---|
| Google Maps | `GOOGLE_MAPS_API_KEY` | Server-only; no `NEXT_PUBLIC_` prefix; all calls via server proxy |
| Anthropic | `ANTHROPIC_API_KEY` | Server-only; only in `lib/ai/client.ts` |

Google Maps API key must be restricted in Google Cloud Console to the specific APIs used (Geocoding, Places) and, ideally, to the server's IP.

### 13.4 Credit Transaction Security (Race Condition Prevention)

Credits are never checked and debited in separate transactions:

```
Phase 1 (before Claude call):
  BEGIN TRANSACTION
    SELECT balance ... FOR UPDATE   ← row-level lock
    IF balance < 1 AND NOT unlimited → ROLLBACK; return 402
    INSERT ai_generation (status=QUEUED)
    UPDATE journey SET status='GENERATING'
  COMMIT

Phase 2 (after successful Claude call):
  BEGIN TRANSACTION
    INSERT journey_stops
    INSERT credit_transaction (CONSUMPTION)
    UPDATE credit_wallet SET balance = balance - 1
    UPDATE ai_generation (status=COMPLETED)
    UPDATE journey SET status='READY'
  COMMIT

On any error in Phase 2:
  INSERT credit_transaction (REFUND)
  UPDATE ai_generation (status=FAILED)
  UPDATE journey SET status='FAILED'
```

### 13.5 Input Validation

All route handler inputs validated with Zod before any DB access. Validation failures return `422` with a `fields` object for client-side field-level display.

### 13.6 Rate Limiting

```
POST /api/v1/journeys/[id]/generate  — 10 req/user/hour
POST /api/v1/journeys/[id]/refine    — 20 req/user/hour
GET  /api/v1/maps/autocomplete       — 60 req/user/minute
```

Implementation: in-memory counter for single-instance; Upstash Redis for production.

### 13.7 Authentication on Every Endpoint

All route handlers begin with the standard auth check:

```typescript
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'Sign in required.' } },
    { status: 401 }
  );
}
```

No exceptions. No endpoint returns data without a valid session.

### 13.8 Soft-Delete Guard

All `Journey` queries include `deletedAt: null`. The `assertJourneyOwner` helper enforces this automatically. Do not query `Journey` without this guard.

---

## 14. Risks

### 14.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Vercel function timeout during Claude generation (>10s on Hobby tier) | High | High | Upgrade to Vercel Pro; set `maxDuration = 60` in route config |
| Claude output fails Zod validation | Medium | Medium | Generous `.optional()` on non-critical fields; retry logic; no credit charge on failure |
| Google Maps API quota exhaustion from autocomplete | Medium | Medium | Server-side LRU cache (5 min TTL); per-user rate limit |
| `@react-google-maps/api` incompatibility with React 19 | Low | High | Verify before Phase 2; fallback to raw Google Maps JS API if needed |
| Anthropic API rate limits under concurrent load | Low | Medium | Per-user daily cap; exponential backoff on 429 |
| Credit race condition | Low | High | Database-level `FOR UPDATE` locking in pre-auth transaction |
| Prisma transaction timeout on long operations | Medium | High | Never hold DB transaction open during Claude call (two-phase pattern) |
| Zustand store state persisting across navigations | Medium | Medium | Explicit `store.reset()` in builder page `useEffect` cleanup |

### 14.2 UX Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| User abandons during generation | High | Low | Journey stays in `GENERATING`; user can retry; no credit charged |
| User confused by `DRAFT` state | Medium | Medium | Clear "Generate your itinerary" CTA with credit cost shown |
| Location permission denied; no location set | Medium | Medium | Manual autocomplete fallback always available; book recs not shown until location is set |
| Mobile builder layout too cramped | Medium | High | Design mobile tab layout before implementing; test on real device |

### 14.3 AI Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Claude recommends tourist traps | Medium | Medium | Iterate system prompt; add explicit exclusion examples; version prompts |
| Claude generates impossible itineraries | Medium | Medium | Pace-based stop count limits in Zod schema; per-pace soft limits in prompt |
| Refinement loses prior context | Low | Medium | Pass last N=5 refinements as conversation history |
| AI costs exceed budget during development | Medium | Low | `MAX_AI_CALLS_PER_DAY` limit; test with minimal journeys |

### 14.4 Database Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Schema migration fails on existing data | Low | High | All new fields are nullable; test on dev database copy first |
| `JourneyStop.order` violation during concurrent refinement | Low | Medium | Status guard (`READY → REFINING`); single active refinement at a time |
| `AiPromptLog` table grows unboundedly | High (eventually) | Low | Implement `redactedAt` job; plan archival after 90 days |

### 14.5 Deployment Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Google Maps API key in client bundle | Low | Critical | CI check: `grep -r "GOOGLE_MAPS_API_KEY" .next/` must return empty |
| Anthropic API key in client bundle | Low | Critical | Same CI check for `ANTHROPIC_API_KEY` |
| Missing env vars in production | Medium | High | Maintain `.env.example` with all required keys; verify in deployment checklist |

---

## 15. Milestone Checklist

> Mark `[x]` when complete. Never delete items. Add notes in parentheses when relevant.

### Phase 1 — Schema Foundation
- [ ] Add `city`, `state`, `country`, `countryCode`, `formattedAddress`, `latitude`, `longitude`, `locationPlaceId`, `locationUpdatedAt` to `Profile` in `schema.prisma`
- [ ] Add `@@index([userId, status, updatedAt])` to `Journey`
- [ ] Add `@@index([userId, status, score])` to `DestinationRecommendation`
- [ ] Add `@@index([countryCode])` to `Profile`
- [ ] Run `prisma migrate dev --name add_location_indexes`
- [ ] Run `prisma generate`
- [ ] Verify all existing pages load without error after migration

### Phase 2 — Server Infrastructure
- [ ] Create `src/lib/ai/client.ts`
- [ ] Verify `ANTHROPIC_API_KEY` set in `.env`
- [ ] Create `src/lib/maps/client.ts`
- [ ] Create `src/lib/maps/place-resolver.ts`
- [ ] Create `src/lib/maps/autocomplete.ts`
- [ ] Verify `GOOGLE_MAPS_API_KEY` set in `.env` (no `NEXT_PUBLIC_` prefix)
- [ ] Create `src/lib/location/detect.ts`
- [ ] Create `src/lib/location/gate.ts`
- [ ] Create `src/lib/journeys/entitlement.ts`
- [ ] Create `src/lib/journeys/credit-service.ts`
- [ ] Create `src/lib/journeys/journey-service.ts` (includes `assertJourneyOwner`)
- [ ] Create `GET /api/v1/maps/autocomplete` route handler
- [ ] Create `GET /api/v1/maps/details/[placeId]` route handler
- [ ] Create `GET /api/v1/maps/reverse` route handler
- [ ] Create `GET /api/v1/credits` route handler
- [ ] Manual test: autocomplete returns predictions
- [ ] Manual test: details returns structured location with `countryCode`

### Phase 3 — AI Pipeline
- [x] Create `src/lib/ai/prompts/journey-plan.ts` (with `PROMPT_VERSION` constant) (Implemented in registry)
- [x] Create `src/lib/ai/prompts/refinement.ts` (Implemented in registry)
- [x] Create `src/lib/ai/prompts/insight.ts` (Implemented in registry)
- [x] Create `src/lib/ai/schemas/journey-output.ts`
- [x] Create `src/lib/ai/schemas/stop-output.ts`
- [x] Create `src/lib/ai/pipeline.ts` (`generateJourney`, `refineJourney`, `generateInsight`)
- [x] Create `POST /api/v1/journeys/[id]/generate` streaming route handler
- [ ] Create `POST /api/v1/journeys/[id]/refine` streaming route handler
- [ ] Integration test: NDJSON stream returns valid events
- [ ] Integration test: `JourneyStop` rows created in DB after generation
- [ ] Integration test: `AiGeneration` record has correct status, tokens, cost
- [ ] Integration test: credit debited atomically on success
- [ ] Integration test: no credit debit on generation failure (Zod parse failure)

### Phase 4 — Journey CRUD + Infrastructure
- [ ] Create `GET /api/v1/journeys`
- [ ] Create `POST /api/v1/journeys`
- [ ] Create `GET /api/v1/journeys/[id]`
- [ ] Create `PATCH /api/v1/journeys/[id]`
- [ ] Create `DELETE /api/v1/journeys/[id]`
- [ ] Create `GET /api/v1/journeys/[id]/refinements`
- [ ] Create `GET /api/v1/me`
- [ ] Create `src/stores/journey-store.ts` with full interface and all actions
- [ ] Create `src/actions/journey-actions.ts`
- [ ] Update `/journeys` page to render real data with cursor pagination
- [ ] Verify cursor pagination works (nextCursor present when more items exist)

### Phase 5 — Journey Builder Workspace
- [ ] Create `src/components/journey/JourneyCard.tsx`
- [ ] Create `src/components/journey/StopCard.tsx`
- [ ] Create `src/components/journey/ItineraryList.tsx`
- [ ] Create `src/components/journey/GeneratingState.tsx`
- [ ] Create `src/components/journey/JourneyMap.tsx` (dynamic, `ssr: false`)
- [ ] Create `src/components/journey/RefinementPanel.tsx`
- [x] Create `src/components/journey/JourneyBuilder.tsx`
- [ ] Create `src/components/journey/JourneyStatusBadge.tsx`
- [ ] Create `src/components/ui/ErrorBoundary.tsx`
- [ ] Create `src/components/ui/SkeletonCard.tsx`
- [ ] Create `src/components/ui/StreamingProgress.tsx`
- [ ] Create `src/app/(dashboard)/journeys/[id]/page.tsx`
- [x] Create `src/app/(dashboard)/journeys/[id]/build/page.tsx`
- [x] Rebuild `src/app/(dashboard)/journeys/new/page.tsx`
- [ ] End-to-end test: create → generate → view stops → refine
- [ ] End-to-end test: FAILED journey shows retry; retry works
- [ ] End-to-end test: map shows pins and pans on stop selection
- [ ] Verify sidebar remains visible throughout builder flow

### Phase 6 — Profile + Location System
- [ ] Create `src/components/location/LocationAutocomplete.tsx`
- [ ] Create `src/components/location/LocationDetect.tsx`
- [ ] Rebuild `src/app/(dashboard)/profile/page.tsx`
- [ ] Create `updateProfile` Server Action in `src/actions/profile-actions.ts`
- [ ] Create `PATCH /api/v1/me/location` route handler
- [ ] Create `PATCH /api/v1/me/profile` route handler
- [ ] Extend `getCachedProfile` in `session-cache.ts` to select all location fields
- [ ] Add location InfoCard to `/settings` page
- [ ] Test: browser geolocation → `countryCode` stored
- [ ] Test: autocomplete → place selected → `countryCode` stored
- [ ] Test: `isUsUser()` returns correct boolean for US vs non-US profiles
- [ ] Test: client cannot set `countryCode` directly (server re-verifies via placeId)

### Phase 7 — Saved Journeys + Saved Places + Explore
- [ ] Create `POST /api/v1/journeys/[id]/save`
- [ ] Create `DELETE /api/v1/journeys/[id]/save`
- [ ] Create `GET /api/v1/saved/journeys`
- [ ] Create `POST /api/v1/places/save`
- [ ] Create `DELETE /api/v1/places/[id]`
- [ ] Create `GET /api/v1/saved/places`
- [ ] Create `GET /api/v1/recommendations`
- [ ] Create `PATCH /api/v1/recommendations/[id]`
- [ ] Create `src/actions/place-actions.ts`
- [ ] Create `src/components/explore/PlaceCard.tsx`
- [ ] Create `src/components/explore/ExploreGrid.tsx`
- [ ] Create `src/components/ui/Tabs.tsx`
- [ ] Create `src/app/(dashboard)/saved/page.tsx`
- [ ] Create `src/app/(dashboard)/saved/places/page.tsx`
- [ ] Create `src/app/(dashboard)/explore/page.tsx`
- [ ] Add "Explore" to sidebar `NAV_ITEMS`
- [ ] Test: save a journey → appears in `/saved`
- [ ] Test: save a place → appears in `/saved/places`
- [ ] Test: US user sees book recommendations on `/explore`
- [ ] Test: non-US user does NOT see book recommendations

### Phase 8 — Dashboard Enhancement + Polish
- [ ] Add "Continue Journey" widget (most recent DRAFT/REFINING)
- [ ] Add "Your Journeys" widget (last 3 journeys)
- [ ] Wire credits balance to real `CreditWallet.balance`
- [ ] Add recommendations teaser (2–3 items)
- [ ] Create `PATCH /api/v1/me/preferences`
- [ ] Implement settings preferences editor
- [ ] Create `src/components/ui/ConfirmDialog.tsx`
- [ ] Add `Suspense` + `SkeletonCard` to all dashboard widgets
- [ ] Add `ErrorBoundary` to all dashboard widgets
- [ ] Add `JOURNEY_VIEWED` activity logging
- [ ] Final audit: no `NEXT_PUBLIC_` API keys in `.next/` bundle
- [ ] Final audit: all pages load in production build (`next build`)
- [ ] Final audit: sidebar nav works for all new pages

---

## 16. Change Log

| Date | Version | Change |
|---|---|---|
| 2026-07-08 | 1.0.0 | Initial plan created. Full M1 codebase audit completed. Architecture review document at `docs/m2_architecture_review.md`. All 8 phases defined with tasks, exit criteria, and dependency rationale. |
| 2026-07-08 | 1.1.0 | Completed Phase 3A: Journey Workspace Foundation (draft creation, react state hook, step components, UI shell). |
| 2026-07-08 | 1.1.1 | Completed Phase 3A Patch: Fixed draft duplication, added Zod validation to actions, and stripped beforeunload. |
| 2026-07-08 | 1.2.0 | Completed Phase 3B.1: AI Foundation. Created provider-agnostic pipeline, Zod output schemas, typed error hierarchy, and prompt registry. |
| 2026-07-08 | 1.2.1 | Completed Phase 3B.2: AI Streaming Infrastructure. Implemented Anthropic SDK, NDJSON streaming, usage tracking, and timeout policy. |

---

## 17. Development Rules

> These rules are permanent. They apply to every task in Milestone 2 and beyond. No individual task instruction can override them.

---

### The Core Rules

**1. Never duplicate pages.**  
Before creating a new page, verify it does not already exist in `src/app/`. If a placeholder exists, build on it — do not create a new file alongside it.

**2. Reuse existing components whenever possible.**  
Check `src/components/` before creating anything new. Check `lib/design.ts` for button styles, form styles, surface recipes, and animation variants before writing new class strings. Deviation from the design system requires explicit justification.

**3. Preserve Milestone 1 architecture.**  
The auth system, session caching, `DashboardShell`, `Sidebar`, `MobileHeader`, design tokens, and `globals.css` are complete and client-approved. Do not modify them without explicit instruction.

**4. Do not break existing authentication.**  
The JWT session pattern, `getCachedSession`, `getCachedProfile`, and route-level redirects must continue to function exactly as built. New features add to this; they do not change it.

**5. Keep UI consistent with Wayheld branding.**  
Use only the design tokens defined in `globals.css` (`--color-brand-*`) and the recipes in `lib/design.ts`. No arbitrary hex colours. No inline styles. No Tailwind utilities that aren't already in the design system.

**6. Optimise for performance by default.**  
Every page starts as a Server Component. Add `"use client"` only when the feature genuinely requires it. Use `Promise.all` for all parallel DB reads. Never use `skip`-based pagination.

**7. Prefer Server Components unless interactivity requires Client Components.**  
Test: does this component respond to user events, use browser APIs, or maintain local state? If no → Server Component.

**8. Every new feature must be documented before implementation.**  
Add the feature to the relevant phase in this document. Describe its component structure, data sources, and API dependencies before writing code.

**9. Every completed task must update this document.**  
Mark the corresponding checklist item `[x]`. Add an entry to the Change Log with the date, version, and description of what changed.

**10. Every implementation must reference this document first.**  
Before starting any task, re-read the relevant phase description and the dependency graph. Confirm no prerequisites are missing. If prerequisites are incomplete, complete them first.

---

### The Technical Rules

**11. All API keys stay server-side.**  
`GOOGLE_MAPS_API_KEY` and `ANTHROPIC_API_KEY` must never appear with a `NEXT_PUBLIC_` prefix. Every Maps call goes through `/api/v1/maps/`. Every Claude call goes through `lib/ai/pipeline.ts`.

**12. Streaming endpoints are Route Handlers.**  
Server Actions cannot stream. The `generate` and `refine` endpoints must be Route Handlers in `/api/v1/`.

**13. Ownership is validated on every mutation.**  
Every route handler that writes to a user-owned resource must call `assertJourneyOwner` (or its equivalent) before proceeding. No exceptions.

**14. Credits are debited in a transaction.**  
The credit check, credit debit, and generation record update occur in distinct Prisma transactions but the credit debit never happens if the generation failed. Never check credits, call Claude, then debit in a single try-catch without proper failure handling.

**15. All Claude output is validated with Zod before any DB write.**  
A failed parse means `AiGeneration.status = FAILED` and zero credit charge. Never write unvalidated AI output to the database.

**16. `countryCode` is never trusted from the client.**  
The server must extract it from Google's `address_components` via a server-side API call. Client-submitted `countryCode` is ignored entirely.

**17. Journey status transitions are enforced server-side.**  
The client cannot set `Journey.status` directly. Status transitions happen only inside route handlers after verifying the current status is a valid predecessor.

**18. Cursor pagination everywhere.**  
Never use `skip`-based pagination. Always use `cursor` + `take` + `nextCursor` pattern. Every `findMany` call has a `take` limit.

**19. Soft-deleted resources are invisible.**  
Every query on `Journey` includes `deletedAt: null`. The `assertJourneyOwner` helper enforces this automatically.

**20. The sidebar never disappears.**  
The Journey Builder, explore page, saved pages, and all new M2 pages render inside the existing `DashboardShell`. The left sidebar and mobile header are always visible. No M2 feature creates a full-screen overlay that hides the application shell.

---

*End of Wayheld Milestone 2 Master Implementation Plan — v1.0.0*  
*Reference: `docs/m2_architecture_review.md` for deeper technical rationale on any section.*
