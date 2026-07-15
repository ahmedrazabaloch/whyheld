import { z } from "zod";

/** Standardized payload for invoking the pipeline */
export interface AiPipelineInput {
  promptId: string;
  version?: string;
  variables: Record<string, any>;
  userId: string;
  /** Optional cancellation signal. When fired, the provider aborts immediately. */
  signal?: AbortSignal;
}

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  durationMs: number;
  provider: string;
  model: string;
}

export type AiStreamEvent =
  | { type: "status"; message: string }
  | { type: "progress"; percentage: number }
  | { type: "thinking"; text: string }
  | { type: "day"; index: number; payload: any }
  | { type: "stop"; index: number; payload: any }
  | { type: "warning"; message: string }
  | { type: "usage"; payload: AiUsage }
  | { type: "complete"; payload: any }
  | { type: "error"; message: string; code?: string };

/** Abstract provider interface */
export interface AiProvider {
  /** Uniquely identifies the provider implementation */
  readonly id: string;

  /** Generate a full structured response */
  generateObject<T>(
    system: string,
    prompt: string,
    schema: z.ZodSchema<T>,
    signal?: AbortSignal,
    options?: { maxTokens?: number }
  ): Promise<T>;

  /** Generate an NDJSON stream for a structured response */
  streamObject<T>(
    system: string,
    prompt: string,
    schema: z.ZodSchema<T>,
    signal?: AbortSignal,
    options?: { maxTokens?: number }
  ): AsyncIterable<AiStreamEvent>;
}
