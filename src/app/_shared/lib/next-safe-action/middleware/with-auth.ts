import { createMiddleware } from 'next-safe-action';

import { UnauthorizedException, JWT_TYPE } from '@/core/shared/domain';

import { JwtService } from '@/core/shared/infrastructure';

import { getCookie } from '@/app/_shared/lib/session/session.service';

const withAuth = createMiddleware().define(async ({ next }) => {
  const token = await getCookie();

  if (!token) throw new UnauthorizedException();

  const result = await JwtService.verify(token, JWT_TYPE.ACCESS);

  const userId = result.getValueOrThrow();

  return next({ ctx: { userId } });
});

export { withAuth };
