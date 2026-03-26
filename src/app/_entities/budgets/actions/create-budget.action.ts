'use server';

import { budgetsController } from '@/core/modules/budgets';

import { actionClient } from '@/app/_lib/safe-action';

import { withAuth } from '@/app/_entities/shared';

import { createBudgetSchema } from '../schema/create-budget.schema';

const createBudgetAction = actionClient
  .use(withAuth)
  .inputSchema(createBudgetSchema)
  .action(async ({ ctx, parsedInput }) => {
    const result = await budgetsController.createBudget(
      ctx.userId,
      parsedInput.category,
      parsedInput.monthlyLimit,
    );

    return result.getValueOrThrow();
  });

export { createBudgetAction };
