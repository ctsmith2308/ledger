'use server';

import { budgetsService } from '@/core/modules/budgets';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';

import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

import { updateBudgetSchema } from '../schema/update-budget.schema';

const updateBudgetAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag(FEATURE_KEYS.BUDGET_WRITE))
  .inputSchema(updateBudgetSchema)
  .action(async ({ ctx, parsedInput }) => {
    return budgetsService.updateBudget(
      ctx.userId,
      parsedInput.budgetId,
      parsedInput.monthlyLimit,
    );
  });

export { updateBudgetAction };
