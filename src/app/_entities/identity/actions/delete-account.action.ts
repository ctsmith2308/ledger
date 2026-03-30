'use server';

import { identityController } from '@/core/modules/identity';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth } from '@/app/_entities/shared/with-auth';
import { withFeatureFlag } from '@/app/_entities/shared/with-feature-flag';
import { deleteCookie } from '@/app/_entities/shared/session.service';

const deleteAccountAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .action(async ({ ctx }) => {
    await identityController.deleteAccount(ctx.userId);

    await deleteCookie();
  });

export { deleteAccountAction };
