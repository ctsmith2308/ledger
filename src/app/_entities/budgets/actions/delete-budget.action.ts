'use server';

import { z } from 'zod';

import { budgetsController } from '@/core/modules/budgets';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';
import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

const deleteBudgetSchema = z.object({
  budgetId: z.string().min(1),
});

const deleteBudgetAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .inputSchema(deleteBudgetSchema)
  .action(async ({ ctx, parsedInput }) => {
    return budgetsController.deleteBudget(
      ctx.userId,
      parsedInput.budgetId,
    );
  });

export { deleteBudgetAction };
