# ADR 001: Location as an Independent Platform Module

**Date**: 2026-07-08
**Status**: Accepted

## Context
Wayheld requires accurate user location data to personalize journeys (via AI reasoning), gate specific features (e.g., US-only Bookshop recommendations), and power future exploration tools (e.g., proximity-based destination discovery). 

Initially, location was conceived as a subset of the `Profile` system. However, as the product roadmap expanded to include the Journey Builder, AI Engine, Explore feed, Saved Places, and future mobile apps, it became clear that tying location tightly to the `Profile` module would create circular dependencies and limit reusability.

Furthermore, we must interact with Google Places APIs to resolve raw text into structured geolocation data. Using the legacy Google Places API limits our ability to use the newest data fields and pricing models.

## Decisions

### 1. Location is a Shared Platform Module
Location will be implemented as a standalone, independent module (`src/lib/location/`). 
It will **not** be a sub-feature of `Profile`. Instead, `Profile`, `Journey`, `Explore`, `AI`, and `Bookshop Gate` will all depend on the `Location` module. This enforces a clear unidirectional data flow:
`Location Module → Feature Modules`

### 2. Strict Internal Architecture
The `src/lib/location/` module will be strictly segregated by responsibility:
- `google.ts`: Solely responsible for HTTP communication with Google APIs.
- `parser.ts`: Converts Google's raw responses into Wayheld's standard internal location object.
- `validation.ts`: Houses Zod schemas; responsible for removing empty strings and validating coordinates/country codes.
- `service.ts`: Exposes the main business logic and acts as the entry point for all features.
- `env.ts`: Validates the `GOOGLE_MAPS_API_KEY` at startup.
- `types.ts`: Defines shared TypeScript interfaces.

### 3. Use Google Places API (New)
We will exclusively use the **Google Places API (New)**. The legacy Places API will not be used, ensuring access to the latest field masks, modern REST architecture, and future-proofing the application.

### 4. Server-Side Normalization and Security
No Google APIs will be exposed directly to the client. All communication follows this flow:
`Google API → Parser → Location Service → Server Action / Route Handler → UI`
The server will never trust client-supplied country codes. Country codes will be normalized server-side to ISO 3166-1 alpha-2 standards.

## Consequences
- **Positive**: High reusability across web and future mobile apps.
- **Positive**: Secure API keys (never exposed to the browser).
- **Positive**: Strict data integrity (no invalid country codes or empty strings entering the database).
- **Negative**: Slight increase in initial setup time to build the abstraction layers (`google.ts`, `parser.ts`, `service.ts`).
