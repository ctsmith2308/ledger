'use server';

import { identityController } from '@/core/modules/identity';
import { actionClient, withRateLimit } from '@/app/_lib/safe-action';
import { registerUserSchema } from '../schema/register.schema';

const registerAction = actionClient
  .use(withRateLimit)
  .inputSchema(registerUserSchema)
  .action(async ({ parsedInput }) => {
    const result = await identityController.registerUser(
      parsedInput.email,
      parsedInput.password,
    );

    return result.getValueOrThrow();
  });

export { registerAction };
