'use server';

import { budgetsController } from '@/core/modules/budgets';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth } from '@/app/_entities/shared/with-auth';
import { withFeatureFlag } from '@/app/_entities/shared/with-feature-flag';

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
