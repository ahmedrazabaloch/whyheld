export class AiError extends Error {
  public readonly code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = "AiError";
    this.code = code;
  }
}

export class AiValidationError extends AiError {
  constructor(message: string) {
    super(message, "AI_VALIDATION_ERROR");
    this.name = "AiValidationError";
  }
}

export class ProviderUnavailableError extends AiError {
  constructor(message: string = "The AI provider is currently unavailable.") {
    super(message, "PROVIDER_UNAVAILABLE");
    this.name = "ProviderUnavailableError";
  }
}

export class PromptNotFoundError extends AiError {
  constructor(promptId: string, version?: string) {
    super(`Prompt '${promptId}' ${version ? `(v${version}) ` : ""}not found.`, "PROMPT_NOT_FOUND");
    this.name = "PromptNotFoundError";
  }
}

export class RateLimitError extends AiError {
  constructor(message: string = "AI provider rate limit exceeded.") {
    super(message, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
  }
}

export class ParsingError extends AiError {
  public readonly rawPayload: unknown;

  constructor(message: string, rawPayload?: unknown) {
    super(`Failed to parse AI output: ${message}`, "PARSING_ERROR");
    this.name = "ParsingError";
    this.rawPayload = rawPayload;
  }
}
