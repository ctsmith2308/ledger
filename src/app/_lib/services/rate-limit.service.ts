import { headers } from 'next/headers';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import { Result, RateLimitException } from '@/core/shared/domain';

const _ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

const _getIdentifier = (
  httpHeaders: Awaited<ReturnType<typeof headers>>,
  userId?: string,
): string => {
  if (userId) return `user:${userId}`;

  // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Headers/get#examples
  const forwarded = httpHeaders.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'anonymous';

  return `ip:${ip}`;
};

const RateLimitService = {
  async checkLimit(userId?: string) {
    const httpHeaders = await headers();

    const identifier = _getIdentifier(httpHeaders, userId);

    const { success } = await _ratelimit.limit(identifier);

    return success ? Result.ok(true) : Result.fail(new RateLimitException());
  },
};

export { RateLimitService };
