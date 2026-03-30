import { cache } from 'react';

import { bankingController } from '@/core/modules/banking';

import { loadSession } from '@/app/_entities/identity/loaders';

const loadAccounts = cache(async () => {
  const session = await loadSession();

  const result = await bankingController.getAccounts(session.userId);

  return result.getValueOrThrow();
});

export { loadAccounts };
