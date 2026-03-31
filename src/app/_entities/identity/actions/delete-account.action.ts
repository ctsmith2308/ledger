'use server';

import { identityController } from '@/core/modules/identity';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';
import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';
import { deleteCookie } from '@/app/_shared/lib/session/session.service';

const deleteAccountAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .action(async ({ ctx }) => {
    await identityController.deleteAccount(ctx.userId);

    await deleteCookie();
  });

export { deleteAccountAction };
