# ADR 002: AI Architecture Foundation

## Status
Accepted

## Context
Wayheld relies on AI to curate slow-travel itineraries. However, AI models (Anthropic, OpenAI, etc.) are volatile. APIs change, models deprecate, and new capabilities emerge. The core application (Journey Builder, UI, Database) must be strictly decoupled from the underlying AI provider. Furthermore, AI outputs must never be trusted blindly by the frontend; they must be structured and validated on the server.

## Decision
We are establishing a dedicated `src/lib/ai/` module that serves as an absolute boundary between the application and any external LLM provider. The Journey Builder will NEVER call Anthropic or OpenAI directly. It will only invoke the `executeAiPipeline` or `streamAiPipeline`.

### Folder Structure
```text
src/lib/ai/
  ├── client.ts             # Provider resolution and dependency injection
  ├── pipeline.ts           # Orchestration (input -> validation -> provider -> output)
  ├── types.ts              # Core domain interfaces
  ├── config.ts             # Centralized configuration (models, timeouts, temperatures)
  ├── errors.ts             # Typed error hierarchy (AiValidationError, ParsingError, etc.)
  ├── providers/            # Concrete implementations of AiProvider
  │   └── anthropic.ts      
  ├── prompts/              
  │   └── registry.ts       # Versioned prompt storage mapping ID -> Prompt Definition
  └── schemas/              
      └── journey.ts        # Zod schemas defining exactly what the UI expects
```

### Prompt Strategy
Prompts are treated as versioned code. They are not hardcoded into route handlers. The `PromptRegistry` maps an ID (e.g., `JOURNEY_PLAN`) and version (`1.0.0`) to a `PromptDefinition` which contains the System Prompt, the User Prompt builder function, and the expected Zod output schema. 

**Semantic Versioning**: The registry uses a proper semver sorting algorithm (e.g. comparing major, minor, and patch numerically) to ensure that version `"10.0.0"` correctly resolves as newer than `"2.0.0"` when the `"latest"` prompt is requested. This guarantees safe evolution and reproducibility for older journeys.

**Prompt Safety & Sandboxing**: To mitigate prompt injection vulnerabilities, raw user input is never blindly concatenated into instructions. All user variables are strictly wrapped in XML delimiters (e.g., `<input><destination>{vars.destination}</destination></input>`). The system prompt explicitly instructs the LLM to treat anything within `<input>` tags as read-only variables and to ignore any executable instructions found within them.

### Provider Abstraction & Configuration
The `AiProvider` interface enforces two methods: `generateObject` and `streamObject`. `providers/anthropic.ts` implements this interface. 
**Provider-Owned Configuration**: The pipeline (`pipeline.ts`) passes only the system prompt, user prompt, and expected schema to the provider. The pipeline has zero knowledge of models, timeouts, or temperatures. The provider implementation itself is entirely responsible for retrieving its specific model identifier (e.g. `claude-3-5-sonnet`) and parameters from the `AI_CONFIG`. Adding OpenAI in the future simply requires a new file implementing `AiProvider` that pulls the OpenAI config keys.

### Output Validation
Zod is the ultimate gatekeeper. The pipeline invokes `.safeParse()` on all raw AI outputs. If the payload is malformed or hallucinates fields, a `ParsingError` is thrown, halting execution before malformed JSON can crash the React client or poison the database.

### Error Handling
Generic `Error`s are banned in the AI layer. All failures throw typed errors descending from `AiError` (`PromptNotFoundError`, `ProviderUnavailableError`, `RateLimitError`). This allows Route Handlers to return precise HTTP status codes and actionable UI feedback.

### Future Integration: Streaming
The `streamAiPipeline` yields an `AsyncIterable<AiStreamEvent>`. In Phase 3B.2, Next.js Route Handlers will consume this iterator and pipe it directly to the browser via ReadableStream (NDJSON), allowing the client to parse complete JSON lines incrementally.

### Future Integration: Refinement
Refinements will use the exact same pipeline but call a different Prompt ID (`JOURNEY_REFINEMENT`). The pipeline architecture seamlessly supports passing the existing `Journey` object and chat history as variables to the `buildUserPrompt` function.
