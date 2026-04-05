'use server';

import { bankingService } from '@/core/modules/banking';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';

import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

import { unlinkBankSchema } from '../schema/unlink-bank.schema';

const unlinkBankAction = actionClient
  .metadata({ actionName: 'unlinkBank' })
  .use(withAuth)
  .use(withFeatureFlag(FEATURE_KEYS.PLAID_CONNECT))
  .inputSchema(unlinkBankSchema)
  .action(async ({ ctx, parsedInput }) => {
    return bankingService.unlinkBank(ctx.userId, parsedInput.plaidItemId);
  });

export { unlinkBankAction };
