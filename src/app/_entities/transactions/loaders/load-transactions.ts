import { cache } from 'react';

import { transactionsController } from '@/core/modules/transactions';

import { loadSession } from '@/app/_entities/identity/loaders';

const loadTransactions = cache(async () => {
  const session = await loadSession();

  const result = await transactionsController.getTransactions(session.userId);

  return result.getValueOrThrow();
});

export { loadTransactions };
