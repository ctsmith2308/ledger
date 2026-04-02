'use server';

import { bankingService } from '@/core/modules/banking';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';

import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

const createLinkTokenAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag(FEATURE_KEYS.PLAID_CONNECT))
  .action(async ({ ctx }) => {
    return bankingService.createLinkToken(ctx.userId);
  });

export { createLinkTokenAction };
