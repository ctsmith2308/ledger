import { describe, it, expect, beforeEach } from 'vitest';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { checkLimitCurry } from '@/app/_entities/shared';
import { RateLimitException } from '@/core/shared/domain';

const redis = Redis.fromEnv();

const _createCheckLimit = (maxRequests: number, ip = '127.0.0.1') => {
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, '1 m'),
    prefix: 'test:ratelimit',
  });

  const resolveHeaders = async () =>
    new Headers({ 'x-forwarded-for': ip });

  return checkLimitCurry(ratelimit, resolveHeaders);
};

describe('checkRateLimit', () => {
  beforeEach(async () => {
    const keys = await redis.keys('test:ratelimit*');

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  });

  it('allows requests within the limit', async () => {
    const checkLimit = _createCheckLimit(5);

    const result = await checkLimit();

    expect(result.isSuccess).toBe(true);
  });

  it('blocks requests exceeding the limit', async () => {
    const checkLimit = _createCheckLimit(3);

    await checkLimit();
    await checkLimit();
    await checkLimit();

    const result = await checkLimit();

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(RateLimitException);
  });

  it('tracks limits per IP independently', async () => {
    const checkLimitA = _createCheckLimit(1, '10.0.0.1');
    const checkLimitB = _createCheckLimit(1, '10.0.0.2');

    await checkLimitA();
    const blockedA = await checkLimitA();
    const allowedB = await checkLimitB();

    expect(blockedA.isFailure).toBe(true);
    expect(allowedB.isSuccess).toBe(true);
  });
});
