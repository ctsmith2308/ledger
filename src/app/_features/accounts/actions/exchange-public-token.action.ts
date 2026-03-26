'use server';

import { bankingController } from '@/core/modules/banking';
import {
  SchemaValidator,
  createAction,
  withAuth,
  type ActionCtx,
  type AuthContext,
} from '@/app/_lib';
import {
  exchangePublicTokenSchema,
  type ExchangePublicTokenInput,
} from '../schema/exchange-public-token.schema';

const handler = async (ctx: ActionCtx, input: ExchangePublicTokenInput) => {
  const { userId } = ctx as AuthContext;

  const dto = SchemaValidator.parse(
    exchangePublicTokenSchema,
    input,
  ).getValueOrThrow();

  const result = await bankingController.exchangePublicToken(
    userId,
    dto.publicToken,
  );

  return result.getValueOrThrow();
};

const exchangePublicTokenAction = createAction(handler, [withAuth]);

export { exchangePublicTokenAction };
