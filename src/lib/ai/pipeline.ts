import { z } from "zod";
import type { AiPipelineInput, AiStreamEvent } from "./types";
import { getAiProvider } from "./client";
import { getPrompt } from "./prompts/registry";
import { ParsingError } from "./errors";

/**
 * Standardized AI execution pipeline.
 *
 * Stages:
 * 1. Input Resolution
 * 2. Prompt Compilation  (includes variable validation — registry's responsibility)
 * 3. Provider Resolution
 * 4. Execution (Provider Call)
 * 5. Strict Output Validation
 */
export async function executeAiPipeline<T>(input: AiPipelineInput): Promise<T> {
  const { promptId, version, variables, signal } = input;

  // 1 & 2. Resolve and compile prompt (registry validates + sanitizes variables)
  const promptDef = getPrompt<T>(promptId, version);
  const userPrompt = promptDef.buildUserPrompt(variables);

  // 3. Resolve provider
  const provider = getAiProvider();

  let maxTokens: number | undefined;
  if (promptId === "JOURNEY_PLAN") {
    const d = variables.duration ? Number(variables.duration) : 7;
    if (d <= 3) maxTokens = 4000;
    else if (d <= 5) maxTokens = 6000;
    else if (d <= 7) maxTokens = 9000;
    else if (d <= 10) maxTokens = 12000;
    else if (d <= 14) maxTokens = 16000;
    else maxTokens = 16000;
  } else if (promptId === "DISCOVERY_PLACES") {
    const c = variables.count ? Number(variables.count) : 10;
    maxTokens = c <= 5 ? 3500 : 5500;
  } else if (promptId === "JOURNEY_FROM_DISCOVERY") {
    const d = variables.duration ? Number(variables.duration) : 7;
    if (d <= 5) maxTokens = 6000;
    else if (d <= 10) maxTokens = 10000;
    else maxTokens = 14000;
  } else if (promptId === "REGENERATE_JOURNEY_DAY") {
    maxTokens = 3500;
  }

  // 4. Execute — P1#4: forward cancellation signal to the provider
  const rawOutput = await provider.generateObject<T>(
    promptDef.systemPrompt,
    userPrompt,
    promptDef.schema,
    signal,
    { maxTokens }
  );

  // 5. Strict Output Validation
  const validation = promptDef.schema.safeParse(rawOutput);
  if (!validation.success) {
    throw new ParsingError(validation.error.message, rawOutput);
  }

  return validation.data;
}

/**
 * Streaming version of the AI execution pipeline.
 * Yields NDJSON-compatible chunk events.
 *
 * P2#7: When the prompt definition declares an itemSchema, each "day" event
 * payload is validated against it. Invalid payloads emit a "warning" event
 * and are dropped rather than forwarded to the caller.
 */
export async function* streamAiPipeline<T>(
  input: AiPipelineInput
): AsyncIterable<AiStreamEvent> {
  const { promptId, version, variables, signal } = input;

  // 1 & 2. Resolve and compile prompt (registry validates + sanitizes variables)
  const promptDef = getPrompt<T>(promptId, version);
  const userPrompt = promptDef.buildUserPrompt(variables);

  // 3. Resolve provider
  const provider = getAiProvider();

  let maxTokens: number | undefined;
  if (promptId === "JOURNEY_PLAN") {
    const d = variables.duration ? Number(variables.duration) : 7;
    // Scale tokens generously — rich per-stop metadata (morning/afternoon/evening
    // narratives, logistics, hidden gems) consumes ~600-1000 tokens per day.
    if (d <= 3) maxTokens = 4000;
    else if (d <= 5) maxTokens = 6000;
    else if (d <= 7) maxTokens = 9000;
    else if (d <= 10) maxTokens = 12000;
    else if (d <= 14) maxTokens = 16000;
    else maxTokens = 16000; // Claude's practical limit for streaming
  }

  // 4. Stream — P1#4: forward cancellation signal to the provider
  const stream = provider.streamObject<T>(
    promptDef.systemPrompt,
    userPrompt,
    promptDef.schema,
    signal,
    { maxTokens }
  );

  for await (const chunk of stream) {
    // P2#7: Validate streamed "day" event payloads when the prompt defines an itemSchema.
    if (chunk.type === "day" && promptDef.itemSchema) {
      const result = promptDef.itemSchema.safeParse(chunk.payload);
      if (!result.success) {
        // Instead of dropping the entire day, try to salvage it by filtering out
        // only the stops that fail validation and re-parsing.
        const payload = chunk.payload as any;
        if (payload && Array.isArray(payload.stops)) {
          const { StopOutputSchema } = await import("./schemas/journey");
          const validStops = payload.stops.filter((s: any) => StopOutputSchema.safeParse(s).success);
          if (validStops.length > 0 || payload.summary) {
            const salvaged = { ...payload, stops: validStops };
            const salvageResult = promptDef.itemSchema.safeParse(salvaged);
            if (salvageResult.success) {
              console.warn(`[pipeline] Day ${chunk.index} had ${payload.stops.length - validStops.length} invalid stop(s) — salvaged with ${validStops.length} valid stop(s).`);
              yield { ...chunk, payload: salvageResult.data };
              continue;
            }
          }
        }
        // Truly unrecoverable — emit warning and skip.
        console.warn(`[pipeline] Day ${chunk.index} payload failed validation and could not be salvaged:`, result.error.message);
        yield {
          type: "warning",
          message: `Day ${chunk.index} payload failed validation: ${result.error.message}`,
        };
        continue;
      }
      // Yield with the validated (coerced) payload.
      yield { ...chunk, payload: result.data };
      continue;
    }

    yield chunk;
  }
}
