'use server';

import { identityService } from '@/core/modules/identity';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';

import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

import { AuthManager } from '@/app/_shared/lib/session';

const deleteAccountAction = actionClient
  .metadata({ actionName: 'deleteAccount' })
  .use(withAuth)
  .use(withFeatureFlag(FEATURE_KEYS.ACCOUNT_WRITE))
  .action(async ({ ctx }) => {
    await identityService.deleteAccount(ctx.userId);

    await AuthManager.revokeSession();
  });

export { deleteAccountAction };
