import { cache } from 'react';

import { transactionsController } from '@/core/modules/transactions';

import { loadSession } from '@/app/_entities/identity/loaders';

const loadSpending = cache(async (month: Date) => {
  const session = await loadSession();

  const result = await transactionsController.getSpendingByCategory(
    session.userId,
    month,
  );

  return result.getValueOrThrow();
});

export { loadSpending };
