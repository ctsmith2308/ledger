'use server';

import { z } from 'zod';

import { budgetsController } from '@/core/modules/budgets';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth, withFeatureFlag } from '@/app/_entities/shared';

const deleteBudgetSchema = z.object({
  budgetId: z.string().min(1),
});

const deleteBudgetAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .inputSchema(deleteBudgetSchema)
  .action(async ({ ctx, parsedInput }) => {
    const result = await budgetsController.deleteBudget(
      ctx.userId,
      parsedInput.budgetId,
    );

    return result.getValueOrThrow();
  });

export { deleteBudgetAction };
