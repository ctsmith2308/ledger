'use server';

import { bankingController } from '@/core/modules/banking';
import { actionClient, withAuth } from '@/app/_lib/safe-action';

const getAccountsAction = actionClient
  .use(withAuth)
  .action(async ({ ctx }) => {
    const result = await bankingController.getAccounts(ctx.userId);

    return result.getValueOrThrow();
  });

export { getAccountsAction };
