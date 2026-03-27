'use server';

import { identityController } from '@/core/modules/identity';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth } from '@/app/_entities/shared';

import { updateProfileSchema } from '../schema/update-profile.schema';

const updateUserProfileAction = actionClient
  .use(withAuth)
  .inputSchema(updateProfileSchema)
  .action(async ({ ctx, parsedInput }) => {
    const result = await identityController.updateUserProfile(
      ctx.userId,
      parsedInput.firstName,
      parsedInput.lastName,
    );

    return result.getValueOrThrow();
  });

export { updateUserProfileAction };
