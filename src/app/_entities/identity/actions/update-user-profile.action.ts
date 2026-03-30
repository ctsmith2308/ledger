'use server';

import { identityController } from '@/core/modules/identity';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth, withFeatureFlag } from '@/app/_entities/shared';

import { updateProfileSchema } from '../schema/update-profile.schema';

const updateUserProfileAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .inputSchema(updateProfileSchema)
  .action(async ({ ctx, parsedInput }) => {
    return identityController.updateUserProfile(
      ctx.userId,
      parsedInput.firstName,
      parsedInput.lastName,
    );
  });

export { updateUserProfileAction };
