'use server';

import { bankingController } from '@/core/modules/banking';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth } from '@/app/_entities/shared/with-auth';
import { withFeatureFlag } from '@/app/_entities/shared/with-feature-flag';

const createLinkTokenAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .action(async ({ ctx }) => {
    return bankingController.createLinkToken(ctx.userId);
  });

export { createLinkTokenAction };
