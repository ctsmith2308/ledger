'use server';

import { identityService } from '@/core/modules/identity';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';

import { AuthManager } from '@/app/_shared/lib/session';

const logoutAction = actionClient
  .metadata({ actionName: 'logoutUser' })
  .use(withAuth)
  .action(async ({ ctx }) => {
    if (ctx.sessionId) {
      await identityService.logoutUser(ctx.sessionId);
    }

    await AuthManager.revokeSession();
  });

export { logoutAction };
