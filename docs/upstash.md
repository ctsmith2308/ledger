# Upstash Redis

**External references:**
- [Upstash Redis](https://upstash.com/docs/redis)
- [@upstash/redis SDK](https://github.com/upstash/redis-js)
- [@upstash/ratelimit](https://github.com/upstash/ratelimit-js)
- [QStash](https://upstash.com/docs/qstash)

## Overview

[Upstash](https://upstash.com/) serves three purposes in this project: **rate limiting** (Redis), **feature flag caching** (Redis), and **durable event delivery** (QStash). Redis uses the [`@upstash/redis`](https://github.com/upstash/redis-js) SDK with the `Redis.fromEnv()` connection pattern, which reads two environment variables:

- `UPSTASH_REDIS_REST_URL` -- the REST endpoint for the Upstash Redis instance.
- `UPSTASH_REDIS_REST_TOKEN` -- the bearer token for authentication.

No connection pooling or keepalive configuration is needed. Upstash operates over HTTP/REST, which fits the serverless execution model of Next.js server actions.

---

## Rate Limiting

**Source:** `src/app/_shared/lib/rate-limit/rate-limit.service.ts`

Rate limiting uses `@upstash/ratelimit` with a sliding window algorithm: 10 requests per minute, keyed by client IP.

```ts
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});
```

The identifier is derived from the `x-forwarded-for` header, falling back to `'anonymous'` when the header is absent:

```ts
const forwarded = httpHeaders.get('x-forwarded-for');
const ip = forwarded ? forwarded.split(',')[0].trim() : 'anonymous';
const identifier = `ip:${ip}`;
```

### Testability

The core logic is extracted into `checkLimitCurry`, a curried function that accepts the `Ratelimit` instance and a header resolver as arguments. This makes the function unit-testable without hitting Redis or requiring Next.js request context:

```ts
const checkLimitCurry =
  (ratelimit: Ratelimit, headers: ResolveHeaders) => async () => {
    const httpHeaders = await headers();
    // ... resolve IP, check limit
    return success ? Result.ok(true) : Result.fail(new RateLimitException());
  };
```

The exported `checkRateLimit` is the curried function bound to the real `Ratelimit` instance and Next.js `headers()`, wrapped in React's `cache()` to deduplicate within a single request lifecycle.

### Middleware Integration

**Source:** `src/app/_shared/lib/next-safe-action/middleware/with-rate-limit.ts`

The `withRateLimit` middleware calls `checkRateLimit()` and unwraps the result with `getValueOrThrow()`. If the limit is exceeded, `RateLimitException` propagates to `handleServerError`, which maps it to a client-facing error response.

```ts
const withRateLimit = createMiddleware().define(async ({ next }) => {
  const result = await checkRateLimit();
  result.getValueOrThrow();
  return next();
});
```

---

## Feature Flag Cache

### Interface

**Source:** `src/core/shared/domain/services/feature-flag-cache.service.interface.ts`

```ts
interface IFeatureFlagCache {
  getFeatures(userId: string): Promise<string[] | null>;
  setFeatures(userId: string, features: string[]): Promise<void>;
  invalidate(userId: string): Promise<void>;
}
```

The interface lives in the domain layer. The implementation is infrastructure.

### Implementation

**Source:** `src/core/shared/infrastructure/cache/feature-flag.cache.impl.ts`

`UpstashFeatureFlagCache` stores feature flags as Redis sets under the key pattern `user:{userId}:features` with a 1-hour TTL.

```ts
const CACHE_KEY = (userId: string) => `user:${userId}:features`;
const CACHE_TTL = 60 * 60;
```

`setFeatures` deletes the existing key before writing to avoid stale members accumulating across updates. If the feature list is empty, nothing is written (the key stays deleted).

```ts
async setFeatures(userId: string, features: string[]): Promise<void> {
  const key = CACHE_KEY(userId);
  await this.redis.del(key);
  if (features.length > 0) {
    await this.redis.sadd(key, ...(features as [string, ...string[]]));
    await this.redis.expire(key, CACHE_TTL);
  }
}
```

### Singleton

**Source:** `src/core/shared/infrastructure/cache/feature-flag-cache.singleton.ts`

A module-level singleton binds the cache to `Redis.fromEnv()`:

```ts
const redis = Redis.fromEnv();
const featureFlagCache = new UpstashFeatureFlagCache(redis);
```

This singleton is imported by middleware and layout files.

### Cache-Aside Pattern

The feature flag cache follows a cache-aside (lazy-load) strategy. The cache is populated on first access, not at login time.

**1. Middleware reads from cache (sub-ms).**

**Source:** `src/app/_shared/lib/next-safe-action/middleware/with-feature-flag.ts`

The `withFeatureFlag` middleware checks whether a specific feature is enabled for the authenticated user:

```ts
let features = await featureFlagCache.getFeatures(userId);
```

**2. Cache miss triggers fallback and repopulation.**

If the cache returns `null` (first access, TTL expired, or invalidated), the middleware falls back to the database, resolves the user's account tier, queries enabled features, and repopulates the cache:

```ts
if (!features) {
  const account = await identityService.getUserAccount(userId);
  features = account.features;
  await featureFlagCache.setFeatures(userId, features);
}
```

**3. Invalidation.**

`featureFlagCache.invalidate(userId)` deletes the Redis key. The next request that hits the middleware triggers a miss, which repopulates from the database. This is used when a user's tier changes or feature flags are updated administratively.

---

## Layout Hydration

**Source:** `src/app/(dashboard)/layout.tsx`

Server-rendered layouts read feature flags from the cache and hydrate them into the React Query client so client components can access flags without an additional network call:

```ts
const features = await featureFlagCache.getFeatures(session.userId) ?? [];

queryClient.setQueryData(queryKeys.session, session);
queryClient.setQueryData(queryKeys.featureFlags, features);
```

The dehydrated state is passed to `<HydrationBoundary>`, making feature flags available to any client component that calls `useQuery` with the `queryKeys.featureFlags` key.

---

## QStash -- Durable Event Delivery

**Source:** `src/core/shared/infrastructure/bus/event-bus.impl.ts`

QStash backs the `EventBus` for async event handler execution. When `eventBus.dispatch()` is called, the event is persisted to Postgres first, then published to QStash. QStash delivers the event to `/api/events` via HTTP, where `eventBus.process()` runs the registered handlers sequentially.

This decouples the event write from handler execution. The HTTP request that triggered the event returns immediately after persisting and publishing. Handlers run asynchronously via the webhook.

See `docs/flows.md` for the full event lifecycle diagram.

## Roadmap

**Redis session validation.** The `UserSession` aggregate is already in place with opaque session tokens. Moving session validation from database lookups to Redis would reduce latency on every authenticated request and enable immediate revocation (the proxy currently checks JWT signature only, not revocation status).
