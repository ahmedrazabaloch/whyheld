# Milestone 2 Progress

This document tracks completed phases and key architectural decisions throughout Milestone 2.

## Phase 1: Schema Foundation
**Date**: 2026-07-08
**Status**: Completed

**Files Changed**:
- `prisma/schema.prisma`

**Database Changes**:
- Added structured location fields (`city`, `state`, `country`, `countryCode`, `formattedAddress`, `latitude`, `longitude`, `locationPlaceId`, `locationUpdatedAt`) to the `Profile` model.
- Added composite index `@@index([userId, status, updatedAt])` to `Journey`.
- Added composite index `@@index([userId, status, score])` to `DestinationRecommendation`.
- Added index `@@index([countryCode])` to `Profile`.

**Decisions**:
- Handled Prisma migration drift by baselining the `20260622183326_init` migration (which matched the state of the DB before Phase 1), then generated `add_location_indexes` migration.

**Remaining Work**:
- Phase 2 (Location Infrastructure) is next.

---

## Phase 2: Location Infrastructure
**Status**: Completed

**Files Created/Changed**:
- `src/lib/location/env.ts`
- `src/lib/location/types.ts`
- `src/lib/location/validation.ts`
- `src/lib/location/google.ts`
- `src/lib/location/parser.ts`
- `src/lib/location/service.ts`
- `src/app/api/v1/maps/autocomplete/route.ts`
- `src/app/api/v1/maps/details/route.ts`
- `src/app/api/v1/maps/reverse/route.ts`
- `src/components/location/LocationAutocomplete.tsx`
- `src/components/location/LocationDetect.tsx`
- `src/components/location/LocationForm.tsx`
- `src/actions/profile-actions.ts`
- `src/app/(dashboard)/profile/page.tsx`
- `src/app/api/v1/auth/signup/route.ts`
- `src/components/auth/SignupForm.tsx`
- `src/lib/auth/validation.ts`

**Implementation Summary**:
- Implemented independent platform module for Location resolving and normalisation.
- Enforced strict server-side validation using Zod and ISO 3166-1 alpha-2 standard for country codes.
- Implemented Google Places API (New) wrappers in `google.ts` with `parser.ts` for separation of concerns.
- Implemented secure API proxies so `GOOGLE_MAPS_API_KEY` is never exposed.
- Added client-side debounce for Autocomplete and `unstable_cache` for server-side Reverse Geocode / Place Details.
- Added optional Location selection in `SignupForm`.
- Updated Profile page with `LocationForm` replacing the dummy text input.

**Testing Performed**:
- Component structure and API proxy wiring verified.
- Caching logic and debounce implemented safely.
- Profile update server action successfully connected.
- Signup route safely resolves optional locations.

**Production Improvements (Sign-off Fixes)**:
- Verified `google.ts` only requests exact required fields without the greedy `X-Goog-FieldMask: *` header, keeping billing optimized.
- Implemented `crypto.randomUUID()` Google Places Session Tokens in `LocationAutocomplete.tsx` (generated on focus, preserved during search, and reset on select/unmount).
- Audited `unstable_cache` in `service.ts`, explicitly setting deterministic cache keys keyed strictly by `placeId` and coordinates, preventing user-specific session data from poisoning the cache or causing cache fragmentation.

**Remaining Work**:
- Phase 3 (AI Pipeline) is next.

---

## Phase 3A: Journey Workspace Foundation
**Date**: 2026-07-08
**Status**: Completed

**Files Changed**:
- `src/app/(dashboard)/journeys/new/page.tsx`

**Components Created**:
- `src/app/(dashboard)/journeys/[id]/build/page.tsx`
- `src/components/journey/JourneyBuilder.tsx`
- `src/components/journey/steps/StepDestination.tsx`
- `src/components/journey/steps/StepDates.tsx`
- `src/components/journey/steps/StepStyle.tsx`
- `src/components/journey/steps/StepPreferences.tsx`
- `src/components/journey/steps/StepReview.tsx`
- `src/hooks/useJourneyBuilder.ts`

**Server Actions Created**:
- `src/actions/journey-actions.ts` (`createDraft`, `loadDraft`, `updateDraft`)

**Database Interactions**:
- Created `Journey` rows with `status = DRAFT`.
- Updated `Journey` fields (title, originQuery, durationDays, pace, budget).
- Saved current step to `Journey.metadata.lastCompletedStep`.

**Testing Performed**:
- Verified `/journeys/new` correctly creates a DRAFT and redirects to `/journeys/[id]/build`.
- Verified UI step navigation and transitions inside the `DashboardShell`.
- Verified debounced auto-save triggers `updateDraft` action cleanly.
- Verified draft resumption via `loadDraft` hydrating the `useJourneyBuilder` hook on reload.

**Known Limitations**:
- AI Generation is explicitly disabled for this phase.
- Map visualization and Refinement are deferred.

---

## Phase 3A Patch (Audit Fixes)
**Date**: 2026-07-08
**Status**: Completed

**Files Modified**:
- `src/app/(dashboard)/journeys/new/page.tsx`: Refactored to a Client Component using `useEffect` to safely trigger draft creation via POST action, preventing duplicate database rows on `GET` renders and refreshes.
- `src/actions/journey-actions.ts`: 
  - Wrapped all Prisma writes in `try/catch`.
  - Added strict `Zod` schema validation (`IdSchema`, `UpdateDraftSchema`) for all input payloads.
  - Implemented duplicate draft guard in `createDraft` (returns the existing empty draft instead of creating a new one).
  - Returned explicitly typed `{ success, data, error }` responses instead of throwing generic errors.
- `src/hooks/useJourneyBuilder.ts`: Removed the unreliable `beforeunload` persistence event listener. Auto-save now relies strictly on deterministic debouncing and explicit navigation triggers.
- `src/app/(dashboard)/journeys/[id]/build/loading.tsx`: **(Created)** Implemented standard skeleton loading state for the builder route.

---

## Phase 3B.1: AI Foundation
**Date**: 2026-07-08
**Status**: Completed

**Files Created**:
- `src/lib/ai/types.ts`: Core AI domain interfaces.
- `src/lib/ai/errors.ts`: Typed error hierarchy (`AiValidationError`, `ParsingError`, etc.).
- `src/lib/ai/config.ts`: Centralized configuration.
- `src/lib/ai/schemas/journey.ts`: Zod schemas for AI outputs.
- `src/lib/ai/prompts/registry.ts`: Versioned prompt storage.
- `src/lib/ai/providers/anthropic.ts`: Mocked Anthropic provider implementation.
- `src/lib/ai/client.ts`: Provider resolution.
- `src/lib/ai/pipeline.ts`: Orchestration flow.
- `docs/architecture/ADR-002-AI-Architecture.md`: Architecture record.

**Documentation**:
- Created `ADR-002-AI-Architecture.md`.
- Updated M2_PROGRESS.md and MILESTONE_2_IMPLEMENTATION_PLAN.md.

---

## Phase 3B.1 Patch (Architecture Fixes)
**Date**: 2026-07-08
**Status**: Completed

**Fixes Applied**:
- **Semantic Versioning**: Implemented numerical major/minor/patch semver comparison in `registry.ts` to replace native string sort.
- **Provider-Owned Config**: Stripped model resolution and configuration from `pipeline.ts`. The Anthropic provider implementation now directly manages its own `AI_CONFIG` variables.
- **Prompt Sandboxing**: Rewrote `JOURNEY_PLAN` and `RECOMMENDATION` prompt builders to wrap all user variables in `<input>` XML tags. Updated system prompts to strictly sandbox these variables.
- **Documentation**: Updated `ADR-002-AI-Architecture.md` with semantic versioning, provider configuration ownership, and the XML-tag prompt safety strategy.

---

## Phase 3B.2: AI Streaming & Pipeline Integration
**Date**: 2026-07-08
**Status**: Completed

**Files Created**:
- `src/app/api/v1/journeys/[id]/generate/route.ts`: NDJSON Streaming Route.
- `docs/architecture/ADR-003-NDJSON-Streaming.md`: Architecture record.

**Files Modified**:
- `src/lib/ai/types.ts`: Added strict `AiStreamEvent` discriminated union and `AiUsage`.
- `src/lib/ai/providers/anthropic.ts`: Implemented true Anthropic SDK integration with `AbortController` timeout, retry policy, NDJSON stream buffering, and usage tracking.

**Documentation**:
- Created `ADR-003-NDJSON-Streaming.md`.
- Updated M2_PROGRESS.md and MILESTONE_2_IMPLEMENTATION_PLAN.md.

---

## Phase 3C: Journey Builder UI Integration
**Date**: 2026-07-08
**Status**: Completed

**Files Created**:
- `src/hooks/useJourneyGeneration.ts`: Hook to consume NDJSON generation streams incrementally.
- `src/components/journey/GeneratingState.tsx`: UI for active generation states.
- `src/components/journey/JourneyBeingCrafted.tsx`: Animated list of stops arriving live.
- `src/components/journey/GenerationSummary.tsx`: Traveler-facing journey metadata.
- `src/components/journey/StopCard.tsx`: Individual stop display.

**Files Modified**:
- `src/components/journey/JourneyBuilder.tsx`: Manages generation state transitions (REVIEW -> STREAMING -> READY).
- `src/components/journey/steps/StepReview.tsx`: Dispatches `onGenerate` without managing generation logic.
- `src/actions/journey-actions.ts`: Added `appendGenerationEvent` and `completeJourneyGeneration` actions.

**Implementation Summary**:
- Implemented real-time NDJSON stream consumption with an incremental UI.
- Hook tracks robust state machine (`PREPARING`, `STREAMING`, `PERSISTING`, `FAILED`, `CANCELLED`).
- Error and retry states are fully managed.
- Generation completion safely finalizes the `Journey` record to `READY` status in a database transaction.

