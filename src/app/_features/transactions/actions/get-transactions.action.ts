'use server';

import { transactionsController } from '@/core/modules/transactions';
import { actionClient, withAuth } from '@/app/_lib/safe-action';

const getTransactionsAction = actionClient
  .use(withAuth)
  .action(async ({ ctx }) => {
    const result = await transactionsController.getTransactions(ctx.userId);

    return result.getValueOrThrow();
  });

export { getTransactionsAction };
