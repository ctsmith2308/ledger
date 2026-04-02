'use server';

import { bankingService } from '@/core/modules/banking';

import { FEATURE_KEYS } from '@/core/shared/domain';

import { actionClient } from '@/app/_shared/lib/next-safe-action/action-client';

import { withAuth } from '@/app/_shared/lib/next-safe-action/middleware/with-auth';

import { withFeatureFlag } from '@/app/_shared/lib/next-safe-action/middleware/with-feature-flag';

import { exchangePublicTokenSchema } from '../schema/exchange-public-token.schema';

const exchangePublicTokenAction = actionClient
  .metadata({ actionName: 'exchangePublicToken' })
  .use(withAuth)
  .use(withFeatureFlag(FEATURE_KEYS.PLAID_CONNECT))
  .inputSchema(exchangePublicTokenSchema)
  .action(async ({ ctx, parsedInput }) => {
    return bankingService.exchangePublicToken(
      ctx.userId,
      parsedInput.publicToken,
    );
  });

export { exchangePublicTokenAction };
