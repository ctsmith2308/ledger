'use server';

import { transactionsController } from '@/core/modules/transactions';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth } from '@/app/_entities/shared/with-auth';
import { withFeatureFlag } from '@/app/_entities/shared/with-feature-flag';

const syncTransactionsAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .action(async ({ ctx }) => {
    return transactionsController.syncTransactions(ctx.userId);
  });

export { syncTransactionsAction };
