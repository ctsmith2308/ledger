import { cache } from 'react';

import { loadProfile } from '@/app/_entities/identity/loaders';
import { loadAccounts } from '@/app/_entities/banking/loaders';
import { loadTransactions } from '@/app/_entities/transactions/loaders';

const loadOverview = cache(async () => {
  const [profile, accounts, transactions] = await Promise.all([
    loadProfile(),
    loadAccounts(),
    loadTransactions(),
  ]);

  return { profile, accounts, transactions };
});

export { loadOverview };
