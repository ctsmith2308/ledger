'use server';

import { identityController } from '@/core/modules/identity';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withRateLimit } from '@/app/_shared/lib/next-safe-action/middleware/with-rate-limit';

import { registerUserSchema } from '../schema/register.schema';

const registerAction = actionClient
  .use(withRateLimit)
  .inputSchema(registerUserSchema)
  .action(async ({ parsedInput }) => {
    return identityController.registerUser(
      parsedInput.firstName,
      parsedInput.lastName,
      parsedInput.email,
      parsedInput.password,
    );
  });

export { registerAction };
