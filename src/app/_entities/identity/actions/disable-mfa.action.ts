'use server';

import { identityService } from '@/core/modules/identity';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';

import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

const disableMfaAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .action(async ({ ctx }) => {
    await identityService.disableMfa(ctx.userId);
  });

export { disableMfaAction };
