export type RateLimitStoreName = "memory" | "upstash";

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  store: RateLimitStoreName;
}

interface RateLimitBucket {
  timestamps: number[];
  lastSeenAt: number;
}

interface RateLimitSettings {
  windowMs: number;
  maxRequests: number;
  globalWindowMs: number;
  globalMaxRequests: number;
  maxBuckets: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();
let globalRequestTimestamps: number[] = [];
let rateLimitChecks = 0;

function readPositiveInteger(name: string, fallback: number): number {
  const parsed = Number(process.env[name] ?? "");
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

export function rateLimitSettings(): RateLimitSettings {
  return {
    windowMs: readPositiveInteger("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1_000),
    maxRequests: readPositiveInteger("RATE_LIMIT_MAX_REQUESTS", 5),
    globalWindowMs: readPositiveInteger("GLOBAL_RATE_LIMIT_WINDOW_MS", 60 * 1_000),
    globalMaxRequests: readPositiveInteger("GLOBAL_RATE_LIMIT_MAX_REQUESTS", 100),
    maxBuckets: readPositiveInteger("RATE_LIMIT_MAX_BUCKETS", 10_000),
  };
}

export function sharedRateLimitConfigured(): boolean {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim() ?? "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? "";
  return url.startsWith("https://") && token.length >= 16;
}

export function resetRateLimitForTests(): void {
  rateLimitBuckets.clear();
  globalRequestTimestamps = [];
  rateLimitChecks = 0;
}

function pruneRateLimitBuckets(now: number, settings: RateLimitSettings): void {
  for (const [key, bucket] of rateLimitBuckets) {
    const timestamps = bucket.timestamps.filter(
      (timestamp) => now - timestamp < settings.windowMs,
    );

    if (timestamps.length === 0 && now - bucket.lastSeenAt >= settings.windowMs) {
      rateLimitBuckets.delete(key);
    } else {
      bucket.timestamps = timestamps;
    }
  }
}

function consumeMemoryRateLimit(key: string, now: number): RateLimitDecision {
  const settings = rateLimitSettings();
  rateLimitChecks += 1;
  if (rateLimitChecks % 64 === 0 || rateLimitBuckets.size >= settings.maxBuckets) {
    pruneRateLimitBuckets(now, settings);
  }

  globalRequestTimestamps = globalRequestTimestamps.filter(
    (timestamp) => now - timestamp < settings.globalWindowMs,
  );

  if (globalRequestTimestamps.length >= settings.globalMaxRequests) {
    const retryAfterMs =
      settings.globalWindowMs - (now - (globalRequestTimestamps[0] ?? now));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1_000)),
      store: "memory",
    };
  }

  if (rateLimitBuckets.size >= settings.maxBuckets && !rateLimitBuckets.has(key)) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(settings.windowMs / 1_000),
      store: "memory",
    };
  }

  const bucket = rateLimitBuckets.get(key) ?? { timestamps: [], lastSeenAt: now };
  bucket.timestamps = bucket.timestamps.filter(
    (timestamp) => now - timestamp < settings.windowMs,
  );
  bucket.lastSeenAt = now;

  if (bucket.timestamps.length >= settings.maxRequests) {
    rateLimitBuckets.set(key, bucket);
    const retryAfterMs = settings.windowMs - (now - (bucket.timestamps[0] ?? now));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1_000)),
      store: "memory",
    };
  }

  bucket.timestamps.push(now);
  rateLimitBuckets.set(key, bucket);
  globalRequestTimestamps.push(now);

  return {
    allowed: true,
    remaining: settings.maxRequests - bucket.timestamps.length,
    retryAfterSeconds: 0,
    store: "memory",
  };
}

async function redisIncrement(key: string, windowMs: number): Promise<number> {
  const base = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/, "") ?? "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ?? "";
  const response = await fetch(base + "/pipeline", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["PEXPIRE", key, String(windowMs), "NX"],
    ]),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Shared rate limit store rejected the request.");
  }

  const payload = (await response.json()) as Array<{ result?: unknown }>;
  const count = Number(payload[0]?.result);
  if (!Number.isInteger(count) || count < 1) {
    throw new Error("Shared rate limit store returned an unreadable counter.");
  }
  return count;
}

async function consumeUpstashRateLimit(key: string): Promise<RateLimitDecision> {
  const settings = rateLimitSettings();
  const identityCount = await redisIncrement("strefa29:inquiry:" + key, settings.windowMs);
  if (identityCount > settings.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(settings.windowMs / 1_000),
      store: "upstash",
    };
  }

  const globalCount = await redisIncrement("strefa29:inquiry:global", settings.globalWindowMs);
  if (globalCount > settings.globalMaxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil(settings.globalWindowMs / 1_000),
      store: "upstash",
    };
  }

  return {
    allowed: true,
    remaining: settings.maxRequests - identityCount,
    retryAfterSeconds: 0,
    store: "upstash",
  };
}

export async function consumeInquiryRateLimit(
  key: string,
  now = Date.now(),
): Promise<RateLimitDecision> {
  if (sharedRateLimitConfigured()) {
    return consumeUpstashRateLimit(key);
  }
  return consumeMemoryRateLimit(key, now);
}
