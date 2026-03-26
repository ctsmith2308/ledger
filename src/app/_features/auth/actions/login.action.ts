'use server';

import { identityController } from '@/core/modules/identity';
import { actionClient, withRateLimit } from '@/app/_lib/safe-action';
import { setSession } from '@/app/_lib/session';
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

    await setSession(sessionId);
  });

export { loginAction };
