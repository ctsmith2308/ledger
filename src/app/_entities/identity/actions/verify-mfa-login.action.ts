'use server';

import { identityService } from '@/core/modules/identity';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withRateLimit } from '@/app/_shared/lib/next-safe-action/middleware/with-rate-limit';

import { withMfaChallenge } from '@/app/_shared/lib/next-safe-action/middleware/with-mfa-challenge';

import { setCookie } from '@/app/_shared/lib/session/session.service';

import { verifyMfaLoginSchema } from '../schema/verify-mfa.schema';

const verifyMfaLoginAction = actionClient
  .use(withRateLimit)
  .use(withMfaChallenge)
  .inputSchema(verifyMfaLoginSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { token } = await identityService.verifyMfaLogin(
      ctx.userId,
      parsedInput.totpCode,
    );

    await setCookie(token);
  });

export { verifyMfaLoginAction };
