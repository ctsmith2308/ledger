'use server';

import { identityController } from '@/core/modules/identity';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withRateLimit, setCookie } from '@/app/_entities/shared';

import { loginUserSchema } from '../schema/login.schema';

const loginAction = actionClient
  .use(withRateLimit)
  .inputSchema(loginUserSchema)
  .action(async ({ parsedInput }) => {
    const result = await identityController.loginUser(
      parsedInput.email,
      parsedInput.password,
    );

    const { sessionId } = result.getValueOrThrow();

    await setCookie(sessionId);
  });

export { loginAction };
