'use server';

import { identityController } from '@/core/modules/identity';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth } from '@/app/_entities/shared';
import { deleteCookie } from '@/app/_entities/shared';

const deleteAccountAction = actionClient
  .use(withAuth)
  .action(async ({ ctx }) => {
    const result = await identityController.deleteAccount(ctx.userId);

    result.getValueOrThrow();

    await deleteCookie();
  });

export { deleteAccountAction };
