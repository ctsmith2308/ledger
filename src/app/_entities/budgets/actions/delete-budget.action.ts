'use server';

import { z } from 'zod';

import { budgetsService } from '@/core/modules/budgets';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';

import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

const deleteBudgetSchema = z.object({
  budgetId: z.string().min(1),
});

const deleteBudgetAction = actionClient
  .metadata({ actionName: 'deleteBudget' })
  .use(withAuth)
  .use(withFeatureFlag(FEATURE_KEYS.BUDGET_WRITE))
  .inputSchema(deleteBudgetSchema)
  .action(async ({ ctx, parsedInput }) => {
    return budgetsService.deleteBudget(ctx.userId, parsedInput.budgetId);
  });

export { deleteBudgetAction };
