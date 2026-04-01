'use server';

import { identityService } from '@/core/modules/identity';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';

import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

import { verifyMfaSetupSchema } from '../schema/verify-mfa.schema';

const verifyMfaSetupAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .inputSchema(verifyMfaSetupSchema)
  .action(async ({ ctx, parsedInput }) => {
    await identityService.verifyMfaSetup(ctx.userId, parsedInput.totpCode);
  });

export { verifyMfaSetupAction };
