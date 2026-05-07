'use server';

import { identityService } from '@/core/modules/identity';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withRateLimit } from '@/app/_shared/lib/next-safe-action/middleware/with-rate-limit';

import { withMfaChallenge } from '@/app/_shared/lib/next-safe-action/middleware/with-mfa-challenge';

import { AuthManager } from '@/app/_shared/lib/session';

import { verifyMfaLoginSchema } from '../schema/verify-mfa.schema';

const verifyMfaLoginAction = actionClient
  .metadata({ actionName: 'verifyMfaLogin' })
  .use(withRateLimit)
  .use(withMfaChallenge)
  .inputSchema(verifyMfaLoginSchema)
  .action(async ({ ctx, parsedInput }) => {
    const response = await identityService.verifyMfaLogin(
      ctx.userId,
      parsedInput.totpCode,
    );

    if (response.type === 'SUCCESS') {
      await AuthManager.setSession(response.token, response.sessionId);
    }
  });

export { verifyMfaLoginAction };
