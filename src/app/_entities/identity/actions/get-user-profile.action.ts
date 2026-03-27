'use server';

import { identityController } from '@/core/modules/identity';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth } from '@/app/_entities/shared';

const getUserProfileAction = actionClient
  .use(withAuth)
  .action(async ({ ctx }) => {
    const result = await identityController.getUserProfile(ctx.userId);

    return result.getValueOrThrow();
  });

export { getUserProfileAction };
