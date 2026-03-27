'use server';

import { transactionsController } from '@/core/modules/transactions';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth } from '@/app/_entities/shared';

const getTransactionsAction = actionClient
  .use(withAuth)
  .action(async ({ ctx }) => {
    const result = await transactionsController.getTransactions(ctx.userId);

    return result.getValueOrThrow();
  });

export { getTransactionsAction };
