'use server';

import { identityService } from '@/core/modules/identity';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';
import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

import { updateProfileSchema } from '../schema/update-profile.schema';

const updateUserProfileAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .inputSchema(updateProfileSchema)
  .action(async ({ ctx, parsedInput }) => {
    return identityService.updateUserProfile(
      ctx.userId,
      parsedInput.firstName,
      parsedInput.lastName,
    );
  });

export { updateUserProfileAction };
