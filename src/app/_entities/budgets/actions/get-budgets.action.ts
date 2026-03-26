'use server';

import { budgetsController } from '@/core/modules/budgets';

import { actionClient } from '@/app/_lib/safe-action';

import { withAuth } from '@/app/_entities/shared';

const getBudgetsAction = actionClient
  .use(withAuth)
  .action(async ({ ctx }) => {
    const result = await budgetsController.getBudgets(ctx.userId);

    return result.getValueOrThrow();
  });

export { getBudgetsAction };
