export const AI_CONFIG = {
  defaultProvider: "anthropic",
  
  models: {
    anthropic: {
      default: "claude-3-5-sonnet-latest",
      fast: "claude-3-haiku-20240307",
    },
    openai: {
      default: "gpt-4o",
      fast: "gpt-4o-mini",
    }
  },

  generation: {
    defaultTemperature: 0.7,
    strictTemperature: 0.1, // For pure data extraction
    creativeTemperature: 0.9,
    
    maxTokens: {
      journeyPlan: 4000,
      refinement: 2000,
      insight: 1000,
    },
    
    timeoutMs: 60000, // 60 seconds
    retryCount: 2,
  }
} as const;
