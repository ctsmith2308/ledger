'use server';

import { transactionsController } from '@/core/modules/transactions';
import { actionClient, withAuth } from '@/app/_lib/safe-action';
import { getSpendingSchema } from '../schema/get-spending.schema';

const getSpendingByCategoryAction = actionClient
  .use(withAuth)
  .inputSchema(getSpendingSchema)
  .action(async ({ ctx, parsedInput }) => {
    const result = await transactionsController.getSpendingByCategory(
      ctx.userId,
      new Date(parsedInput.month),
    );

    return result.getValueOrThrow();
  });

export { getSpendingByCategoryAction };
