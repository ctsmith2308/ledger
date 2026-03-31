import { createMiddleware } from 'next-safe-action';

import { checkRateLimit } from '@/app/_shared/lib/rate-limit/rate-limit.service';

const withRateLimit = createMiddleware().define(async ({ next }) => {
  const result = await checkRateLimit();

  result.getValueOrThrow();

  return next();
});

export { withRateLimit };
