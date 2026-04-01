'use server';

import { identityService } from '@/core/modules/identity';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withRateLimit } from '@/app/_shared/lib/next-safe-action/middleware/with-rate-limit';

import { setCookie } from '@/app/_shared/lib/session/session.service';

import { verifyMfaLoginSchema } from '../schema/verify-mfa.schema';

const verifyMfaLoginAction = actionClient
  .use(withRateLimit)
  .inputSchema(verifyMfaLoginSchema)
  .action(async ({ parsedInput }) => {
    const { accessToken } = await identityService.verifyMfaLogin(
      parsedInput.challengeToken,
      parsedInput.totpCode,
    );

    await setCookie(accessToken);
  });

export { verifyMfaLoginAction };
