import { Redis } from '@upstash/redis';

import { type IFeatureFlagCache } from '../../domain';

const CACHE_KEY = (userId: string) => `user:${userId}:features`;
const CACHE_TTL = 60 * 60;

class UpstashFeatureFlagCache implements IFeatureFlagCache {
  constructor(private readonly redis: Redis) {}

  async getFeatures(userId: string): Promise<string[] | null> {
    const members = await this.redis.smembers(CACHE_KEY(userId));

    return members.length > 0 ? members : null;
  }

  async setFeatures(userId: string, features: string[]): Promise<void> {
    const key = CACHE_KEY(userId);

    await this.redis.del(key);

    if (features.length > 0) {
      await this.redis.sadd(key, ...(features as [string, ...string[]]));
      await this.redis.expire(key, CACHE_TTL);
    }
  }

  async invalidate(userId: string): Promise<void> {
    await this.redis.del(CACHE_KEY(userId));
  }
}

export { UpstashFeatureFlagCache };
