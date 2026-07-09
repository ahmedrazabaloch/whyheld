import { AI_CONFIG } from "./config";
import type { AiProvider } from "./types";
import { AnthropicProvider } from "./providers/anthropic";

// P2#8: Validate required environment variables at module initialisation.
// A missing key produces a runtime 401 on every request — catching it here
// surfaces the misconfiguration immediately at startup instead.
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error(
    "[AI] ANTHROPIC_API_KEY environment variable is not set. " +
      "Set it in your .env file before starting the application."
  );
}

// Instantiate available providers
const providers: Record<string, AiProvider> = {
  anthropic: new AnthropicProvider(),
  // openai: new OpenAIProvider(), // Ready for future
};

/**
 * Returns the resolved AI provider instance based on configuration or override.
 * Ensures the application is not tightly coupled to a single LLM vendor.
 */
export function getAiProvider(providerId?: string): AiProvider {
  const targetId = providerId || AI_CONFIG.defaultProvider;
  const provider = providers[targetId];

  if (!provider) {
    throw new Error(`AI Provider '${targetId}' is not configured or supported.`);
  }

  return provider;
}
