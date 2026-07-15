/**
 * Simple in-memory rate limiter.
 * Designed to be easily replaceable with Redis/Upstash (e.g. @upstash/ratelimit) in the future.
 */

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

export function rateLimit(identifier: string, config: RateLimitConfig): { success: boolean } {
  const now = Date.now();
  const record = store.get(identifier);

  // Expire old record
  if (!record || now > record.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + config.windowMs });
    return { success: true };
  }

  // Enforce limit
  if (record.count >= config.limit) {
    return { success: false };
  }

  // Increment
  record.count += 1;
  store.set(identifier, record);
  return { success: true };
}

/**
 * Extracts the best possible client IP from a Request/NextRequest.
 */
export function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    return xff.split(",")[0].trim();
  }
  
  // NextRequest might expose .ip
  const reqAsAny = request as any;
  if (reqAsAny.ip && typeof reqAsAny.ip === "string") {
    return reqAsAny.ip;
  }

  return "unknown-ip";
}
