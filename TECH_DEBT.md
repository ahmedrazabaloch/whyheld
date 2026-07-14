# Technical Debt

## Season-Aware AI Generation (Phase 6 Enhancement)

**Description:**
The application currently collects and persists user travel dates (`startDate`, `endDate`) via `StepDates` during the Journey Builder onboarding flow. These dates are correctly saved to the database.

However, the AI generation pipeline (`src/app/api/v1/journeys/[id]/generate/route.ts` and `src/lib/ai/prompts/registry.ts`) only receives and processes `durationDays`.

As a result, the generated itinerary is entirely disconnected from calendar dates and is not aware of:
- Seasonality (e.g., suggesting beaches in winter)
- Month-specific conditions
- Weather patterns
- Local holidays
- Festivals or seasonal closures
- Regional conditions

**Action Required:**
In Phase 6, update the AI pipeline and prompt definitions to inject `startDate` and `endDate`. This will allow the AI to curate seasonally appropriate slow-travel recommendations. No changes to the collection UX or database schema are required, as the dates are already persisted correctly.
