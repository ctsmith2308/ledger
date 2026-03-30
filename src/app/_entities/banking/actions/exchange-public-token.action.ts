'use server';

import { bankingController } from '@/core/modules/banking';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth } from '@/app/_entities/shared/with-auth';
import { withFeatureFlag } from '@/app/_entities/shared/with-feature-flag';

import { exchangePublicTokenSchema } from '../schema/exchange-public-token.schema';

const exchangePublicTokenAction = actionClient
  .use(withAuth)
  .use(withFeatureFlag)
  .inputSchema(exchangePublicTokenSchema)
  .action(async ({ ctx, parsedInput }) => {
    return bankingController.exchangePublicToken(
      ctx.userId,
      parsedInput.publicToken,
    );
  });

export { exchangePublicTokenAction };
