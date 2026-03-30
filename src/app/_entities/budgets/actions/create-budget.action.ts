'use server';

import { budgetsController } from '@/core/modules/budgets';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth, withFeatureFlag } from '@/app/_entities/shared';

import { createBudgetSchema } from '../schema/create-budget.schema';

const createBudgetAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .inputSchema(createBudgetSchema)
  .action(async ({ ctx, parsedInput }) => {
    return budgetsController.createBudget(
      ctx.userId,
      parsedInput.category,
      parsedInput.monthlyLimit,
    );
  });

export { createBudgetAction };
