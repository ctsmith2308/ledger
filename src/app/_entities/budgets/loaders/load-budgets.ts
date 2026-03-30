import { cache } from 'react';

import { budgetsController } from '@/core/modules/budgets';

import { loadSession } from '@/app/_entities/identity/loaders';

const loadBudgets = cache(async () => {
  const session = await loadSession();

  const result = await budgetsController.getBudgets(session.userId);

  return result.getValueOrThrow();
});

export { loadBudgets };
