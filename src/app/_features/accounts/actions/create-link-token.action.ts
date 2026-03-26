'use server';

import { bankingController } from '@/core/modules/banking';
import { actionClient, withAuth } from '@/app/_lib/safe-action';

const createLinkTokenAction = actionClient
  .use(withAuth)
  .action(async ({ ctx }) => {
    const result = await bankingController.createLinkToken(ctx.userId);

    return result.getValueOrThrow();
  });

export { createLinkTokenAction };
