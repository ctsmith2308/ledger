'use server';

import { bankingController } from '@/core/modules/banking';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth, withFeatureFlag } from '@/app/_entities/shared';

const createLinkTokenAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .action(async ({ ctx }) => {
    const result = await bankingController.createLinkToken(ctx.userId);

    return result.getValueOrThrow();
  });

export { createLinkTokenAction };
