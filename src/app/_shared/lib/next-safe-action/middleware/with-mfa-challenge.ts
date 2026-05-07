import { createMiddleware } from 'next-safe-action';

import { UnauthorizedException, JWT_TYPE } from '@/core/shared/domain';

import { JwtService } from '@/core/shared/infrastructure/services/jwt.service.impl';

const withMfaChallenge = createMiddleware().define(
  async ({ next, clientInput }) => {
    const { challengeToken } = clientInput as { challengeToken?: string };

    if (!challengeToken) throw new UnauthorizedException();

    const result = await JwtService.verify(
      challengeToken,
      JWT_TYPE.MFA_CHALLENGE,
    );

    const { sub: userId } = result;

    return next({ ctx: { userId } });
  },
);

export { withMfaChallenge };
