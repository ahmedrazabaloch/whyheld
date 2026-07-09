# ADR 003: NDJSON Streaming Infrastructure

## Status
Accepted

## Context
In Phase 3B.2, Wayheld integrates the Anthropic SDK to generate slow-travel itineraries. AI generation takes 10-30 seconds, which is unacceptable for a blocking HTTP request. The UI requires real-time feedback (e.g., "Generating Day 1", "Found 3 stops"). However, we cannot expose raw LLM tokens to the UI because the React client expects structured data.

## Decision
We will use **Newline-Delimited JSON (NDJSON)** over a native `ReadableStream` instead of raw Server-Sent Events (SSE) or WebSockets. 

### Event Protocol
Every chunk sent over the wire MUST be a complete, valid JSON object ending with a newline `\n`. Partial JSON is strictly prohibited. 
We use a discriminated union for strict TypeScript inference on the client:
```typescript
type AiStreamEvent = 
  | { type: "status"; message: string }
  | { type: "progress"; percentage: number }
  | { type: "thinking"; text: string }
  | { type: "day"; index: number; payload: any }
  | { type: "stop"; index: number; payload: any }
  | { type: "warning"; message: string }
  | { type: "usage"; payload: AiUsage }
  | { type: "complete"; payload: any }
  | { type: "error"; message: string; code?: string };
```

### Stream Lifecycle
1. **Initiation**: The Route Handler (`/api/v1/journeys/[id]/generate`) authenticates the user and invokes `streamAiPipeline`.
2. **Buffering**: The `AnthropicProvider` intercepts raw Anthropic `text_delta` streams. It buffers the string until it encounters a newline (signifying the LLM has output a complete NDJSON object).
3. **Parsing & Yielding**: The provider parses the complete JSON line. If it maps to a recognized domain event (`day`, `stop`), it yields the typed `AiStreamEvent`.
4. **Encoding**: The Route Handler takes the yielded event, stringifies it, appends `\n`, and enqueues it to the HTTP `ReadableStream`.
5. **Termination**: The stream yields a `usage` event with exact token counts, followed by `complete`, and closes.

### Retry Policy
Retries occur strictly within the `AnthropicProvider`, completely opaque to the pipeline and route handler.
- We retry ONLY on `429 Rate Limit`, `500+ Server Errors`, or `AbortError` (timeout).
- We DO NOT retry on `ParsingError` (hallucinations), `PromptNotFoundError`, or `AiValidationError` (logic errors).
- Retry count is centralized in `AI_CONFIG.generation.retryCount`.

### Timeout Policy
We use the native `AbortController` API. A strict timeout (`AI_CONFIG.generation.timeoutMs`) is initiated before the Anthropic SDK call. If the timeout triggers, the SDK call aborts, and the provider translates the resulting `AbortError` into our domain `ProviderUnavailableError`.

### Validation
Raw LLM output is inherently untrusted. The provider intercepts the string and forces a `JSON.parse`. The pipeline treats this as untrusted payload. The Route Handler ensures the final stream is tightly typed.

### Provider Boundary
The Route Handler contains zero business logic and zero Anthropic SDK imports. It acts purely as a transport layer wrapping the pipeline's async generator into a web standard `ReadableStream`.
