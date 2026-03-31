'use server';

import { budgetsController } from '@/core/modules/budgets';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth } from '@/app/_entities/shared/with-auth';

import { withFeatureFlag } from '@/app/_entities/shared/with-feature-flag';

import { updateBudgetSchema } from '../schema/update-budget.schema';

const updateBudgetAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .inputSchema(updateBudgetSchema)
  .action(async ({ ctx, parsedInput }) => {
    return budgetsController.updateBudget(
      ctx.userId,
      parsedInput.budgetId,
      parsedInput.monthlyLimit,
    );
  });

export { updateBudgetAction };
