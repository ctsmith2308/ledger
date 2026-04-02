'use server';

import { identityService } from '@/core/modules/identity';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';

import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

const setupMfaAction = actionClient
  .metadata({ actionName: 'setupMfa' })
  .use(withAuth)
  .use(withFeatureFlag(FEATURE_KEYS.MFA))
  .action(async ({ ctx }) => {
    return identityService.setupMfa(ctx.userId);
  });

export { setupMfaAction };
