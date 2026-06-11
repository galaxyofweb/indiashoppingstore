import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as { redis: Redis | undefined }

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    lazyConnect: true,
  })

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis

// ─── Cache helpers ───────────────────────────

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key)
    if (!value) return null
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds = 3600
): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value))
  } catch {
    // Cache failures are non-fatal
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    await redis.del(key)
  } catch {
    // Non-fatal
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) await redis.del(...keys)
  } catch {
    // Non-fatal
  }
}

// ─── Rate limiter ────────────────────────────

export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const key = `rate:${identifier}`
  const now = Date.now()

  try {
    const pipeline = redis.pipeline()
    pipeline.incr(key)
    pipeline.ttl(key)
    const results = await pipeline.exec()

    const count = (results?.[0]?.[1] as number) || 0
    const ttl = (results?.[1]?.[1] as number) || -1

    if (count === 1 || ttl === -1) {
      await redis.expire(key, windowSeconds)
    }

    return {
      allowed: count <= maxRequests,
      remaining: Math.max(0, maxRequests - count),
      resetAt: now + (ttl > 0 ? ttl : windowSeconds) * 1000,
    }
  } catch {
    return { allowed: true, remaining: maxRequests, resetAt: now + windowSeconds * 1000 }
  }
}

// ─── Session store for cart ──────────────────

export async function getCartSession(sessionId: string): Promise<string | null> {
  return redis.get(`cart:session:${sessionId}`)
}

export async function setCartSession(sessionId: string, cartId: string): Promise<void> {
  await redis.setex(`cart:session:${sessionId}`, 7 * 24 * 3600, cartId)
}

// ─── Cache keys ──────────────────────────────

export const CacheKeys = {
  product: (slug: string) => `product:${slug}`,
  productList: (params: string) => `products:list:${params}`,
  category: (slug: string) => `category:${slug}`,
  categories: () => `categories:tree`,
  homepage: () => `page:homepage`,
  siteSettings: () => `settings:all`,
  searchSuggestions: (query: string) => `search:suggest:${query}`,
}
