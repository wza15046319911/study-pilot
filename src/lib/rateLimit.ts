import { createClient, RedisClientType } from "redis";

let redis: RedisClientType | null = null;

async function getRedis(): Promise<RedisClientType | null> {
  if (!process.env.REDIS_URL) {
    console.warn("REDIS_URL not configured, rate limiting disabled");
    return null;
  }

  if (!redis) {
    redis = createClient({ url: process.env.REDIS_URL });
    redis.on("error", (err) => console.error("Redis Client Error", err));
    await redis.connect();
  }

  return redis;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * Simple sliding window rate limiter using Redis
 * @param identifier - Unique identifier (e.g., user ID or IP)
 * @param limit - Maximum requests allowed in the window
 * @param windowSeconds - Time window in seconds
 */
export async function rateLimit(
  identifier: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const client = await getRedis();

  // If Redis is not available, allow the request (fail open)
  if (!client) {
    return { success: true, remaining: limit, reset: 0 };
  }

  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  try {
    // Remove old entries outside the window
    await client.zRemRangeByScore(key, 0, windowStart);

    // Count current requests in window
    const count = await client.zCard(key);

    if (count >= limit) {
      // Get the oldest entry to calculate reset time
      const oldest = await client.zRange(key, 0, 0, { REV: false });
      const resetTime = oldest.length > 0 ? parseInt(oldest[0]) + windowSeconds * 1000 : now + windowSeconds * 1000;

      return {
        success: false,
        remaining: 0,
        reset: Math.ceil((resetTime - now) / 1000),
      };
    }

    // Add current request
    await client.zAdd(key, { score: now, value: now.toString() });

    // Set expiry on the key
    await client.expire(key, windowSeconds);

    return {
      success: true,
      remaining: limit - count - 1,
      reset: windowSeconds,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    // Fail open on error
    return { success: true, remaining: limit, reset: 0 };
  }
}

/**
 * Rate limit presets for different actions
 */
export const rateLimitPresets = {
  // Strict: 5 requests per minute (for sensitive actions like referral code creation)
  strict: (identifier: string) => rateLimit(identifier, 5, 60),

  // Standard: 30 requests per minute (for normal API calls)
  standard: (identifier: string) => rateLimit(identifier, 30, 60),

  // Relaxed: 100 requests per minute (for read-heavy endpoints)
  relaxed: (identifier: string) => rateLimit(identifier, 100, 60),

  // Auth: 10 attempts per 15 minutes (for login/signup)
  auth: (identifier: string) => rateLimit(identifier, 10, 900),
};
