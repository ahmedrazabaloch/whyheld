import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { AiProvider, AiStreamEvent, AiUsage } from "../types";
import { ParsingError, ProviderUnavailableError, RateLimitError } from "../errors";
import { AI_CONFIG } from "../config";

// API key presence is validated by client.ts before this module is used.
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  maxRetries: 0, // Disable SDK auto-retries. AnthropicProvider manual loop is the sole owner.
});

export class AnthropicProvider implements AiProvider {
  public readonly id = "anthropic";

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private translateError(error: unknown): never {
    console.error("[AnthropicProvider] Raw provider error:", error);

    // Handle SDK connection errors (Network failures before HTTP response)
    if (
      error instanceof Anthropic.APIConnectionError ||
      error instanceof Anthropic.APIConnectionTimeoutError ||
      error instanceof TypeError
    ) {
      throw new ProviderUnavailableError("A network failure occurred while connecting to the AI provider. Please try again.");
    }

    if (error instanceof Anthropic.APIError) {
      // Anthropic returns the inner error object inside 'error.error'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const innerType = (error as any).error?.error?.type || (error as any).error?.type;

      // 4. Authentication errors
      // 5. Invalid API key
      if (error.status === 401) {
        throw new ProviderUnavailableError("Invalid API key provided. Please check your Anthropic API key configuration.");
      }
      if (error.status === 403) {
        throw new ProviderUnavailableError("Authentication error: You do not have permission to access the AI provider.");
      }

      if (error.status === 429) {
        // 2. Temporary provider overload
        if (innerType === "overloaded_error") {
          throw new ProviderUnavailableError("The AI provider is currently overloaded. Please try again in a few moments.");
        }
        // 1. Anthropic rate_limit_error caused by exhausted account quota.
        throw new RateLimitError("Your Anthropic account quota has been exhausted or rate limited. Please check your billing details.");
      }

      // 2. Temporary provider overload (529 is officially overloaded_error)
      if (error.status === 529) {
        throw new ProviderUnavailableError("The AI provider is currently overloaded. Please try again in a few moments.");
      }

      if (error.status && error.status >= 500) {
        throw new ProviderUnavailableError("The AI service is temporarily unavailable.");
      }
      
      throw new ProviderUnavailableError("Something went wrong while generating your journey.");
    }
    
    if (error instanceof Error && error.name === "AbortError") {
      throw new ProviderUnavailableError("The AI took too long to respond. Please try again.");
    }

    if (error instanceof ParsingError) {
      throw error;
    }

    throw new ProviderUnavailableError("Something went wrong while generating your journey.");
  }

  /**
   * Returns true when the error is safe to retry.
   *
   * External cancellation (caller-supplied AbortSignal fired) is never retried
   * because the caller has explicitly abandoned the request.
   */
  private isRetryable(
    error: unknown,
    timeoutController: AbortController,
    externalSignal?: AbortSignal
  ): boolean {
    // External caller cancelled — do not retry.
    if (externalSignal?.aborted) return false;

    if (error instanceof Anthropic.APIError) {
      return [500, 502, 503, 504].includes(error.status || 0);
    }
    // AbortError from our own timeout controller → transient, worth retrying.
    if (
      error instanceof Error &&
      error.name === "AbortError" &&
      timeoutController.signal.aborted
    ) {
      return true;
    }
    // Network / fetch-level errors (TypeError: fetch failed, etc.)
    if (error instanceof TypeError) return true;

    return false;
  }

  // -------------------------------------------------------------------------
  // generateObject  (P2#9: uses strictTemperature)
  // -------------------------------------------------------------------------

  async generateObject<T>(
    system: string,
    prompt: string,
    schema: z.ZodSchema<T>,
    externalSignal?: AbortSignal, // P1#4
    options?: { maxTokens?: number }
  ): Promise<T> {
    const model = AI_CONFIG.models.anthropic.default;
    const timeoutMs = AI_CONFIG.generation.timeoutMs;
    const maxRetries = AI_CONFIG.generation.retryCount;

    let attempt = 0;
    while (attempt <= maxRetries) {
      attempt++;

      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), timeoutMs);

      // P1#4: Combine our timeout signal with the caller's cancellation signal.
      const combinedSignal = externalSignal
        ? AbortSignal.any([abortController.signal, externalSignal])
        : abortController.signal;

      try {
        const response = await client.messages.create(
          {
            model,
            max_tokens: options?.maxTokens ?? AI_CONFIG.generation.maxTokens.journeyPlan,
            // P2#9: Structured object generation uses strictTemperature.
            temperature: AI_CONFIG.generation.strictTemperature,
            system,
            messages: [{ role: "user", content: prompt }],
          },
          { signal: combinedSignal }
        );

        clearTimeout(timeout);

        if (response.content[0].type !== "text") {
          throw new ParsingError("Unexpected non-text response from Anthropic");
        }

        const rawText = response.content[0].text;

        let parsed: unknown;
        try {
          parsed = JSON.parse(rawText);
        } catch {
          // Attempt to extract JSON if there's markdown wrapping
          const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            try {
              parsed = JSON.parse(jsonMatch[1]);
            } catch {
              throw new ParsingError("Invalid JSON in Markdown block", rawText);
            }
          } else {
            throw new ParsingError("Could not parse JSON from response", rawText);
          }
        }

        return parsed as T;
      } catch (error) {
        clearTimeout(timeout);
        if (attempt <= maxRetries && this.isRetryable(error, abortController, externalSignal)) {
          await new Promise((res) => setTimeout(res, 1000 * attempt));
          continue;
        }
        this.translateError(error);
      }
    }
    // Unreachable: translateError always throws, but required for TypeScript exhaustiveness.
    throw new ProviderUnavailableError("Max retries exceeded.");
  }

  // -------------------------------------------------------------------------
  // streamObject
  // -------------------------------------------------------------------------

  async *streamObject<T>(
    system: string,
    prompt: string,
    schema: z.ZodSchema<T>,
    externalSignal?: AbortSignal, // P1#4
    options?: { maxTokens?: number }
  ): AsyncIterable<AiStreamEvent> {
    const model = AI_CONFIG.models.anthropic.default;
    const timeoutMs = AI_CONFIG.generation.timeoutMs;
    const maxRetries = AI_CONFIG.generation.retryCount;

    yield { type: "status", message: "Connecting to AI..." };

    const startTime = Date.now();
    // P0#1: Accumulate token counts from the events that actually carry them.
    let inputTokens = 0;
    let outputTokens = 0;

    // -----------------------------------------------------------------------
    // P1#5: Retry the initial HTTP connection only.
    // Once the stream starts delivering chunks, no retry is attempted.
    // -----------------------------------------------------------------------
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let stream: AsyncIterable<any>;
    let activeAbortController!: AbortController;
    let activeTimeout!: ReturnType<typeof setTimeout>;

    for (let attempt = 1; ; attempt++) {
      activeAbortController = new AbortController();
      activeTimeout = setTimeout(() => activeAbortController.abort(), timeoutMs);

      const combinedSignal = externalSignal
        ? AbortSignal.any([activeAbortController.signal, externalSignal])
        : activeAbortController.signal;

      try {
        // Awaiting create() establishes the HTTP connection (this is the retryable boundary).
        // P0#2: system prompt is passed as-is — the provider does NOT append NDJSON instructions.
        stream = await client.messages.create(
          {
            model,
            max_tokens: options?.maxTokens ?? AI_CONFIG.generation.maxTokens.journeyPlan,
            temperature: AI_CONFIG.generation.strictTemperature,
            system,
            messages: [{ role: "user", content: prompt }],
            stream: true,
          },
          { signal: combinedSignal }
        );
        // Connection established. Keep activeTimeout alive — it is refreshed per chunk below.
        break;
      } catch (error) {
        clearTimeout(activeTimeout);
        if (
          attempt <= maxRetries &&
          this.isRetryable(error, activeAbortController, externalSignal)
        ) {
          yield { type: "status", message: `Reconnecting (attempt ${attempt + 1} of ${maxRetries + 1})...` };
          await new Promise((res) => setTimeout(res, 1000 * attempt));
          continue;
        }
        this.translateError(error);
      }
    }

    // -----------------------------------------------------------------------
    // Streaming phase — no retry once chunks are flowing.
    // -----------------------------------------------------------------------
    try {
      let buffer = "";

      for await (const chunk of stream) {
        // Extend the timeout on every live chunk so long responses don't time out.
        activeTimeout.refresh();

        // P0#1: input_tokens lives on the message_start event.
        if (chunk.type === "message_start") {
          inputTokens = chunk.message?.usage?.input_tokens ?? 0;
        }

        // P0#1: output_tokens is finalised in message_delta.
        if (chunk.type === "message_delta") {
          outputTokens = chunk.usage?.output_tokens ?? 0;
        }

        if (
          chunk.type === "content_block_delta" &&
          chunk.delta?.type === "text_delta"
        ) {
          buffer += chunk.delta.text;

          // Flush complete NDJSON lines as they arrive.
          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) >= 0) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (!line) continue;

            try {
              const parsed = JSON.parse(line);
              if (
                parsed.type === "day" ||
                parsed.type === "stop" ||
                parsed.type === "status"
              ) {
                yield parsed as AiStreamEvent;
              } else {
                yield { type: "progress", percentage: 50 };
              }
            } catch {
              // Incomplete or malformed mid-stream line — skip.
            }
          }
        }

        if (chunk.type === "message_stop") {
          // P0#3: Flush any content remaining in the buffer after the last newline.
          // This handles the case where the model's final NDJSON object has no trailing \n.
          const remaining = buffer.trim();
          if (remaining) {
            try {
              const parsed = JSON.parse(remaining);
              if (
                parsed.type === "day" ||
                parsed.type === "stop" ||
                parsed.type === "status"
              ) {
                yield parsed as AiStreamEvent;
              } else {
                yield { type: "progress", percentage: 100 };
              }
            } catch {
              // Final chunk is malformed — discard silently.
            }
            buffer = "";
          }

          // P0#1: Emit accurate usage from the values collected above.
          const usagePayload: AiUsage = {
            inputTokens,
            outputTokens,
            totalTokens: inputTokens + outputTokens,
            durationMs: Date.now() - startTime,
            provider: "anthropic",
            model,
          };
          yield { type: "usage", payload: usagePayload };
        }
      }

      clearTimeout(activeTimeout);
      yield { type: "complete", payload: {} };
    } catch (error) {
      clearTimeout(activeTimeout);
      this.translateError(error);
    }
  }
}
