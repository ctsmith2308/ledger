'use server';

import { budgetsController } from '@/core/modules/budgets';
import { actionClient, withAuth } from '@/app/_lib/safe-action';

const getBudgetsAction = actionClient
  .use(withAuth)
  .action(async ({ ctx }) => {
    const result = await budgetsController.getBudgets(ctx.userId);

    return result.getValueOrThrow();
  });

export { getBudgetsAction };
