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
  if (promptId === "JOURNEY_PLAN" && variables.duration) {
    const d = Number(variables.duration);
    if (d >= 1 && d <= 5) maxTokens = 3000;
    else if (d >= 6 && d <= 10) maxTokens = 5000;
    else if (d >= 11 && d <= 20) maxTokens = 7000;
    else if (d >= 21) maxTokens = 8192;
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
  if (promptId === "JOURNEY_PLAN" && variables.duration) {
    const d = Number(variables.duration);
    // Tokens scaled to accommodate rich per-stop metadata (morning/afternoon/
    // evening narratives, logistics, hidden gems).  Previous values (1500/2500)
    // caused output truncation mid-JSON for detailed itineraries.
    if (d >= 1 && d <= 5) maxTokens = 3000;
    else if (d >= 6 && d <= 10) maxTokens = 5000;
    else if (d >= 11 && d <= 20) maxTokens = 7000;
    else if (d >= 21) maxTokens = 8192;
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
      console.log("[DEBUG Raw Day Payload Before Zod Validation]:", JSON.stringify(chunk.payload, null, 2));
      const result = promptDef.itemSchema.safeParse(chunk.payload);
      if (!result.success) {
        yield {
          type: "warning",
          message: `Day ${chunk.index} payload failed validation: ${result.error.message}`,
        };
        // Drop the invalid payload — do not forward corrupt data to the caller.
        continue;
      }
      // Yield with the validated (coerced) payload.
      yield { ...chunk, payload: result.data };
      continue;
    }

    yield chunk;
  }
}
