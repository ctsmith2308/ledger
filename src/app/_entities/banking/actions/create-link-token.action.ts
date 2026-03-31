'use server';

import { bankingController } from '@/core/modules/banking';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';
import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

const createLinkTokenAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .action(async ({ ctx }) => {
    return bankingController.createLinkToken(ctx.userId);
  });

export { createLinkTokenAction };
