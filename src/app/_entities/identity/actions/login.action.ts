'use server';

import { identityService } from '@/core/modules/identity';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withRateLimit } from '@/app/_shared/lib/next-safe-action/middleware/with-rate-limit';

import { AuthManager } from '@/app/_shared/lib/session';

import { loginUserSchema } from '../schema/login.schema';

const loginAction = actionClient
  .metadata({ actionName: 'loginUser' })
  .use(withRateLimit)
  .inputSchema(loginUserSchema)
  .action(async ({ parsedInput }) => {
    const response = await identityService.loginUser(
      parsedInput.email,
      parsedInput.password,
    );

    if (response.type === 'SUCCESS') {
      await AuthManager.setSession(response.token, response.sessionId);

      return;
    }

    return { challengeToken: response.token };
  });

export { loginAction };
