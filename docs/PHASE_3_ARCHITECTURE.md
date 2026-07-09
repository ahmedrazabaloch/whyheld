# Phase 3 Architecture: Journey Builder & AI Engine

> **Status:** Architecture Planning  
> **Date:** 2026-07-08

This document outlines the architecture, UX strategy, and technical implementation plan for Milestone 2 - Phase 3 (The Journey Builder & AI Engine). Wayheld's Journey Builder is designed to feel like an intentional, premium workspace rather than a generic booking wizard or a ChatGPT interface.

---

## 1. Current Audit

*   **Dashboard Context**: The application uses `DashboardShell`, meaning the sidebar and top navigation are persistent across all authenticated routes.
*   **Existing Builder Stub**: `app/(dashboard)/journeys/new/page.tsx` is currently a placeholder Server Component.
*   **State Management**: Zustand is installed but currently unused. Prior flows (`useOnboarding`) relied on local React state.
*   **Component Ecosystem**: Strong design tokens (`lib/design.ts`), standardized buttons (`buttonStyles`), forms (`formStyles`), and layout sections exist. `LocationAutocomplete` was just built and is ready for reuse.
*   **Prisma Layer**: The `Journey` schema, `JourneyStop`, `AiGeneration`, and `JourneyRefinement` models are strictly typed and ready.

## 2. Existing Reusable Components

We will reuse the following components to prevent duplication and maintain design consistency:
*   `DashboardShell`, `PageHeader`, `Sidebar` (Dashboard structure)
*   `surfaces.card`, `surfaces.panel`, `buttonStyles`, `formStyles` (from `lib/design.ts`)
*   `LocationAutocomplete` (for starting/destination selection)
*   `containerVariants`, `riseVariants` (for Framer Motion transitions)

**Do NOT create**: New wrapper layouts, separate onboard-style full pages, or duplicate form inputs.

## 3. UX Proposal

The Journey Builder must feel like a dedicated workspace seamlessly integrated into the user's dashboard. The flow transitions smoothly within the `DashboardShell`.

**The Step-by-Step Flow:**
1.  **Destination**: The user provides their primary destination, origin query, or starting point using `LocationAutocomplete`.
2.  **Dates**: Selection of start date, end date, or total duration days.
3.  **Travel Style**: The user specifies their pacing (e.g., slow/unhurried) and transport preference.
4.  **Preferences**: Collection of budget tier, crowd avoidance flags, and specialized metadata.
5.  **Review**: A summary screen outlining all collected parameters before the AI is invoked. The user can jump back to edit any step.
6.  **Generate**: Upon clicking "Generate", the form panel transitions into a `GeneratingState`. A skeleton itinerary fades in, accompanied by `StreamingText` indicating AI progress.
7.  **Completed**: The workspace unlocks. The real itinerary stops populate the list.
8.  **Refinement**: A persistent conversational input panel (`RefinementPanel`) becomes available at the bottom/side for natural language tweaks (e.g., "Make day 2 more relaxed").

## 4. Journey State Machine & Resumption

The builder is driven by a state machine mapped to the `JourneyStatus` Prisma enum:

*   **`DRAFT`**: User is navigating the builder steps. Auto-save occurs silently via Server Actions.
*   **`GENERATING`**: User initiated creation. UI locks. NDJSON stream is active.
*   **`READY`**: Generation completed successfully. `JourneyStop`s are persisted. UI unlocks.
*   **`REFINING`**: User submitted a natural language tweak. UI streams the diffs.
*   **`FAILED`**: The AI pipeline timed out or rejected the prompt. Graceful fallback UI shown.
*   **`ARCHIVED`**: Soft-deleted state.

**Resume Journey Architecture:**
If a user abandons a journey in the `DRAFT` state, they can resume it at any time.
- Navigating to `/journeys/new` creates a new `DRAFT` row and redirects to `/journeys/[id]/build`.
- Clicking a draft from the "Past Journeys" or "Continue Journey" widget directly navigates to `/journeys/[id]/build`.
- The `build/page.tsx` Server Component fetches the draft `Journey` and hydrates the initial React state.
- A specific metadata key (e.g., `lastCompletedStep`) stored in `Journey.metadata` dictates which step the builder automatically opens to.

## 5. State Management & Auto-Save Strategy

**State Management (React State over Zustand):**
Zustand is NOT required as the mandatory initial backbone. A carefully structured `useJourneyBuilder` hook utilizing standard React state (`useState`/`useReducer`) is sufficient for the isolated data collection steps. React state coupled with Server Actions minimizes hydration mismatch risks and reduces client bundle complexity. 
Zustand only becomes necessary *later* if deep component trees require complex shared access to the NDJSON stream parser, the interactive map state, or the generated itinerary without intense prop-drilling.

**Auto-Save Strategy:**
To ensure zero data loss while navigating the `DRAFT` state, changes are persisted via background Server Actions (`saveJourneyDraft`).
- **Debounce Interval**: Text inputs trigger a save after 1000ms of inactivity.
- **Save on Blur**: Leaving an input field immediately flushes the pending save.
- **Save on Step Change**: Advancing or retreating between steps triggers an immediate, blocking save to ensure the `lastCompletedStep` metadata is persisted.
- **Save Before Navigation**: Intercepting route changes or using `beforeunload` flushes any unsaved state before the user closes the tab.

## 6. AI Integration & Streaming (NDJSON)

Wayheld handles AI deterministically. Claude never speaks directly to the user.

*   **Streaming Protocol (ReadableStream + NDJSON)**: Server-Sent Events (SSE) will NOT be used. Instead, the Route Handler will return a raw `ReadableStream` outputting Newline-Delimited JSON (NDJSON). This protocol is vastly superior for structured AI outputs as it guarantees complete JSON objects per line, making client-side parsing infinitely more stable and less prone to partial-string JSON crashes.
*   **Prompt Versioning**: Prompts will be stored in `lib/ai/prompts/` and stamped with a version identifier (e.g., `v1.0.0`). The `AiGeneration` row will store the exact prompt version used. This ensures future modifications to the prompt do not break the ability to parse or regenerate older itineraries accurately.
*   **Failure Recovery**: If the AI pipeline fails (timeout, Anthropic API error, or Zod schema rejection):
    - The `Journey` status is marked as `FAILED`.
    - The `AiGeneration` row logs the `errorMessage`.
    - The UI transitions out of the `GeneratingState` into an Error State with a "Try Again" action. The underlying `DRAFT` parameters remain completely intact, allowing the user to seamlessly retry without re-entering data.

## 7. Performance Strategy

*   **Server Components**: The layout and initial shell (`/journeys/[id]/build/page.tsx`) will be Server Components, pre-fetching the draft `Journey` and `getCachedPreferences()`.
*   **Client Components**: The interactive `<JourneyBuilder />` workspace must be a Client Component.
*   **Navigation**: Uses `next/link` and router pushes to keep the SPA feel.
*   **Map Independence**: No architectural commitment is made to Google Maps. The map component acts purely as a consumer of `lat`/`lng` coordinates and remains entirely decoupled from the generation logic.

## 8. Implementation Order

The development order prioritizes building a rock-solid, persistent UX foundation before introducing the volatility of AI streaming.

1.  **Workspace Layout**: Implement the `app/(dashboard)/journeys/[id]/build` shell and step navigation transitions inside the Dashboard. *(Why: Establishes the core UX container and routing before introducing state complexity).*
2.  **Draft Persistence**: Define the TypeScript interfaces and wire the initial React state (`useJourneyBuilder`) hydrated from the Server Component. *(Why: Data structures must be defined before they can be saved).*
3.  **Auto Save**: Implement the Server Actions, debouncing, blur triggers, and step-change saves. *(Why: Validates that the builder can safely hold user data).*
4.  **Resume Journey**: Implement the `/journeys/new` draft creation redirect, and verify that navigating away and back successfully restores the exact step and data. *(Why: Proves the persistence model works end-to-end).*
5.  **Review Screen**: Build the final pre-flight summary screen. *(Why: The final UI step before locking the draft for generation).*
6.  **Generation Placeholder**: Implement the `GeneratingState` UI (loading skeletons, streaming text UI) using mock timeouts. *(Why: perfects the transition UX without waiting on actual LLM latency).*
7.  **AI Pipeline**: Implement Anthropic client, prompt templates, versioning, and Zod schemas in `lib/ai/`. *(Why: AI layer must be strictly typed and stable on the server).*
8.  **NDJSON Streaming**: Build the `/generate` API route and the client-side ReadableStream parser. *(Why: The bridge between AI and the UI).*
9.  **Refinement**: Implement the `RefinementPanel` and natural language diffing logic. *(Why: Requires a successfully completed base journey to operate).*
10. **Maps (future)**: Integrate the map visualization provider. *(Why: Strictly presentational; deferred to isolate AI complexity).*

## 9. File Impact Summary

### Expected to Change
- `src/app/(dashboard)/journeys/new/page.tsx` (Route to init draft and redirect)

### Expected to be Created
- `src/app/(dashboard)/journeys/[id]/build/page.tsx`
- `src/hooks/useJourneyBuilder.ts` (React state manager)
- `src/actions/journey-actions.ts`
- `src/components/journey/JourneyBuilder.tsx`
- `src/components/journey/steps/...`
- `src/components/journey/GeneratingState.tsx`
- `src/components/journey/ItineraryList.tsx`
- `src/components/journey/RefinementPanel.tsx`
- `src/lib/ai/client.ts`
- `src/lib/ai/prompts/...`
- `src/lib/ai/schemas/...`
- `src/lib/ai/pipeline.ts`
- `src/app/api/v1/journeys/[id]/generate/route.ts`
