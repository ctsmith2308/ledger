'use server';

import { bankingController } from '@/core/modules/banking';

import { actionClient } from '@/app/_lib/safe-action';

import { withAuth } from '@/app/_entities/shared';

import { exchangePublicTokenSchema } from '../schema/exchange-public-token.schema';

const exchangePublicTokenAction = actionClient
  .use(withAuth)
  .inputSchema(exchangePublicTokenSchema)
  .action(async ({ ctx, parsedInput }) => {
    const result = await bankingController.exchangePublicToken(
      ctx.userId,
      parsedInput.publicToken,
    );

    return result.getValueOrThrow();
  });

export { exchangePublicTokenAction };
