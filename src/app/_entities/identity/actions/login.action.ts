'use server';

import { identityController } from '@/core/modules/identity';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withRateLimit } from '@/app/_entities/shared/with-rate-limit';
import { setCookie } from '@/app/_entities/shared/session.service';

import { loginUserSchema } from '../schema/login.schema';

const loginAction = actionClient
  .use(withRateLimit)
  .inputSchema(loginUserSchema)
  .action(async ({ parsedInput }) => {
    const { accessToken } = await identityController.loginUser(
      parsedInput.email,
      parsedInput.password,
    );

    await setCookie(accessToken);
  });

export { loginAction };
