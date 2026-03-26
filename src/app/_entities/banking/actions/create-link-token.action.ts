'use server';

import { bankingController } from '@/core/modules/banking';

import { actionClient } from '@/app/_lib/safe-action';

import { withAuth } from '@/app/_entities/shared';

const createLinkTokenAction = actionClient
  .use(withAuth)
  .action(async ({ ctx }) => {
    const result = await bankingController.createLinkToken(ctx.userId);

    return result.getValueOrThrow();
  });

export { createLinkTokenAction };
