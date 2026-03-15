import { RateLimiter } from "limiter";

const limiters = new Map<string, RateLimiter>();

function getLimiter(key: string, limit: number, windowMs: number): RateLimiter {
  const mapKey = `${key}:${limit}:${windowMs}`;
  let limiter = limiters.get(mapKey);
  if (!limiter) {
    limiter = new RateLimiter({
      tokensPerInterval: limit,
      interval: windowMs,
    });
    limiters.set(mapKey, limiter);
  }
  return limiter;
}

/**
 * Check and consume one token for the given key. Uses the limiter package's
 * RateLimiter (token bucket) for consistent, non-blocking rate limiting.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const limiter = getLimiter(key, limit, windowMs);
  const allowed = limiter.tryRemoveTokens(1);
  const remaining = allowed ? limiter.getTokensRemaining() : 0;
  return { allowed, remaining };
}

export function ipFromHeaders(h: Headers) {
  const fwd = h.get("x-forwarded-for");
  if (!fwd) return "unknown";
  const ip = fwd.split(",")[0]?.trim();
  return ip || "unknown";
}
