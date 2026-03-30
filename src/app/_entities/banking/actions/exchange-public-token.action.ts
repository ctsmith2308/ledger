'use server';

import { bankingController } from '@/core/modules/banking';

import { actionClient } from '@/app/_lib/safe-action/action-client';

import { withAuth, withFeatureFlag } from '@/app/_entities/shared';

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
