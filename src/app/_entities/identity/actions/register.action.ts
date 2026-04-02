'use server';

import { identityService } from '@/core/modules/identity';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withRateLimit } from '@/app/_shared/lib/next-safe-action/middleware/with-rate-limit';

import { registerUserSchema } from '../schema/register.schema';

const registerAction = actionClient
  .metadata({ actionName: 'registerUser' })
  .use(withRateLimit)
  .inputSchema(registerUserSchema)
  .action(async ({ parsedInput }) => {
    return identityService.registerUser(
      parsedInput.firstName,
      parsedInput.lastName,
      parsedInput.email,
      parsedInput.password,
    );
  });

export { registerAction };
