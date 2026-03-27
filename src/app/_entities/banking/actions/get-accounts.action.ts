'use server';

import { bankingController } from '@/core/modules/banking';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth } from '@/app/_entities/shared';

const getAccountsAction = actionClient
  .use(withAuth)
  .action(async ({ ctx }) => {
    const result = await bankingController.getAccounts(ctx.userId);

    return result.getValueOrThrow();
  });

export { getAccountsAction };
