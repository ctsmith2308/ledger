import { createMiddleware } from 'next-safe-action';

import { UnauthorizedException } from '@/core/shared/domain';
import { identityController } from '@/core/modules/identity';

import { getCookie } from './session.service';

const withAuth = createMiddleware().define(async ({ next }) => {
  const token = await getCookie();

  if (!token) throw new UnauthorizedException();

  const result = await identityController.getUserSession(token);

  const session = result.getValueOrThrow();

  return next({ ctx: { userId: session.userId, tier: session.tier } });
});

export { withAuth };
