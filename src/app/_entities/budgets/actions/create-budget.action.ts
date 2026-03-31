'use server';

import { budgetsService } from '@/core/modules/budgets';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';
import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

import { createBudgetSchema } from '../schema/create-budget.schema';

const createBudgetAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .inputSchema(createBudgetSchema)
  .action(async ({ ctx, parsedInput }) => {
    return budgetsService.createBudget(
      ctx.userId,
      parsedInput.category,
      parsedInput.monthlyLimit,
    );
  });

export { createBudgetAction };
