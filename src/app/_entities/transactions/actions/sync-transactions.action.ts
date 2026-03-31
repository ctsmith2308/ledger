'use server';

import { transactionsService } from '@/core/modules/transactions';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';
import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

const syncTransactionsAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .action(async ({ ctx }) => {
    return transactionsService.syncTransactions(ctx.userId);
  });

export { syncTransactionsAction };
