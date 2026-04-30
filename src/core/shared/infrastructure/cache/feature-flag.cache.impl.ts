import { Redis } from '@upstash/redis';

import {
  type IFeatureFlagCache,
  FeatureFlagCacheException,
} from '../../domain';

const CACHE_KEY = (userId: string) => `user:${userId}:features`;
const CACHE_TTL = 60 * 60;

/**
 * Redis cache-aside layer for feature flags. Sits in front of
 * FeatureFlagRepository to eliminate DB round-trips on every mutation.
 *
 * Cache key: user:{userId}:features (Redis Set)
 * TTL: 1 hour. Flag changes are not instant; a disabled feature remains
 * cached as enabled for up to one hour unless manually invalidated.
 *
 * Gotcha: setFeatures deletes the key before re-adding members. A
 * concurrent request between del and sadd will see an empty set (cache
 * miss) and fall back to the database. This is a brief consistency
 * window, not a data loss risk.
 */
class UpstashFeatureFlagCache implements IFeatureFlagCache {
  constructor(private readonly redis: Redis) {}

  async getFeatures(userId: string): Promise<string[] | null> {
    try {
      const members = await this.redis.smembers(CACHE_KEY(userId));

      return members.length > 0 ? members : null;
    } catch (error) {
      throw new FeatureFlagCacheException(error);
    }
  }

  async setFeatures(userId: string, features: string[]): Promise<void> {
    try {
      const key = CACHE_KEY(userId);

      await this.redis.del(key);

      if (features.length > 0) {
        await this.redis.sadd(key, ...(features as [string, ...string[]]));
        await this.redis.expire(key, CACHE_TTL);
      }
    } catch (error) {
      throw new FeatureFlagCacheException(error);
    }
  }

  async invalidate(userId: string): Promise<void> {
    try {
      await this.redis.del(CACHE_KEY(userId));
    } catch (error) {
      throw new FeatureFlagCacheException(error);
    }
  }
}

export { UpstashFeatureFlagCache };
