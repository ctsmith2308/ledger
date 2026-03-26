'use server';

import { transactionsController } from '@/core/modules/transactions';
import { actionClient, withAuth } from '@/app/_lib/safe-action';

const syncTransactionsAction = actionClient
  .use(withAuth)
  .action(async ({ ctx }) => {
    const result = await transactionsController.syncTransactions(ctx.userId);

    return result.getValueOrThrow();
  });

export { syncTransactionsAction };
