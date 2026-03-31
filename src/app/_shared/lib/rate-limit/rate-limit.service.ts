import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';
import { cache } from 'react';

import { Result, RateLimitException } from '@/core/shared/domain';

type ResolveHeaders = () => Promise<Headers>;

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

const checkLimitCurry =
  (ratelimit: Ratelimit, headers: ResolveHeaders) => async () => {
    const httpHeaders = await headers();

    const forwarded = httpHeaders.get('x-forwarded-for');

    const ip = forwarded ? forwarded.split(',')[0].trim() : 'anonymous';

    const identifier = `ip:${ip}`;

    const { success } = await ratelimit.limit(identifier);

    return success ? Result.ok(true) : Result.fail(new RateLimitException());
  };

const checkRateLimit = cache(checkLimitCurry(ratelimit, headers));

export { checkRateLimit, checkLimitCurry };
