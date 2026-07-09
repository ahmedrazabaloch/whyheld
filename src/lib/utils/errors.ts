export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "NETWORK_ERROR"
  | "PROVIDER_ERROR"
  | "VALIDATION_ERROR"
  | "INVALID_INPUT";

export type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: string; code: AppErrorCode; referenceId?: string };

export interface AppErrorOptions {
  message: string;
  code: AppErrorCode;
  referenceId?: string;
  cause?: unknown;
}

export class AppError extends Error {
  public code: AppErrorCode;
  public referenceId: string;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
    this.code = options.code;
    this.referenceId = options.referenceId || crypto.randomUUID();
    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

/**
 * Standardizes an unknown error into an AppError and logs it securely.
 */
export function handleServerError(error: unknown, context: string): AppError {
  const referenceId = crypto.randomUUID();
  
  // Secure server-side logging (includes the referenceId for tracing)
  console.error(`[${context}] [Ref: ${referenceId}]`, error);

  if (error instanceof AppError) {
    if (!error.referenceId) error.referenceId = referenceId;
    return error;
  }

  // Handle generic network fetch errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return new AppError({
      code: "NETWORK_ERROR",
      message: "Network request failed. Please check your connection.",
      referenceId,
      cause: error,
    });
  }

  // Fallback to internal error without exposing sensitive stack traces
  return new AppError({
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred while processing your request.",
    referenceId,
    cause: error,
  });
}

/**
 * Translates an AppError code into a user-friendly generic message.
 */
export function getUserFriendlyMessage(code: AppErrorCode): string {
  switch (code) {
    case "UNAUTHORIZED":
      return "Please log in to continue.";
    case "FORBIDDEN":
      return "You don't have permission to perform this action.";
    case "NOT_FOUND":
      return "The requested resource could not be found.";
    case "RATE_LIMITED":
      return "We're receiving a high volume of requests. Please try again in a moment.";
    case "NETWORK_ERROR":
      return "Network connection lost. Please check your internet connection.";
    case "PROVIDER_ERROR":
      return "Our partner services are currently experiencing issues. Please try again.";
    case "VALIDATION_ERROR":
      return "Please check the information you entered and try again.";
    case "INTERNAL_ERROR":
    default:
      return "Something went wrong on our end. Please try again later.";
  }
}
