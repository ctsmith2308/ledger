import { createMiddleware } from 'next-safe-action';

import { getSession } from '../session';
import { checkRateLimit } from '../rate-limit';

const withAuth = createMiddleware().define(async ({ next }) => {
  const result = await getSession();

  const session = result.getValueOrThrow();

  return next({ ctx: { userId: session.userId } });
});

const withRateLimit = createMiddleware().define(async ({ next }) => {
  const result = await checkRateLimit();

  result.getValueOrThrow();

  return next();
});

export { withAuth, withRateLimit };
