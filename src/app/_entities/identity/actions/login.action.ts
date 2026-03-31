'use server';

import { identityService } from '@/core/modules/identity';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withRateLimit } from '@/app/_shared/lib/next-safe-action/middleware/with-rate-limit';
import { setCookie } from '@/app/_shared/lib/session/session.service';

import { loginUserSchema } from '../schema/login.schema';

const loginAction = actionClient
  .use(withRateLimit)
  .inputSchema(loginUserSchema)
  .action(async ({ parsedInput }) => {
    const { accessToken } = await identityService.loginUser(
      parsedInput.email,
      parsedInput.password,
    );

    await setCookie(accessToken);
  });

export { loginAction };
