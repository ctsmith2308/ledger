'use server';

import { transactionsController } from '@/core/modules/transactions';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth } from '@/app/_entities/shared';

const syncTransactionsAction = actionClient
  .use(withAuth)
  .action(async ({ ctx }) => {
    const result = await transactionsController.syncTransactions(ctx.userId);

    return result.getValueOrThrow();
  });

export { syncTransactionsAction };
