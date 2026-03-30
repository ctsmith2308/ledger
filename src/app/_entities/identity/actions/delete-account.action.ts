'use server';

import { identityController } from '@/core/modules/identity';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth, withFeatureFlag, deleteCookie } from '@/app/_entities/shared';

const deleteAccountAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .action(async ({ ctx }) => {
    await identityController.deleteAccount(ctx.userId);

    await deleteCookie();
  });

export { deleteAccountAction };
