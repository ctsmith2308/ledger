import { createMiddleware } from 'next-safe-action';

import { AuthManager } from '@/app/_shared/lib/session';

const withAuth = createMiddleware().define(async ({ next }) => {
  const { userId, sessionId } = await AuthManager.getSession();

  return next({ ctx: { userId, sessionId } });
});

export { withAuth };
