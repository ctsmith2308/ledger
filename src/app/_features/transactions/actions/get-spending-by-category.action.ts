'use server';

import { transactionsController } from '@/core/modules/transactions';
import {
  SchemaValidator,
  createAction,
  withAuth,
  type ActionCtx,
  type AuthContext,
} from '@/app/_lib';
import {
  getSpendingSchema,
  type GetSpendingInput,
} from '../schema/get-spending.schema';

const handler = async (ctx: ActionCtx, input: GetSpendingInput) => {
  const { userId } = ctx as AuthContext;

  const dto = SchemaValidator.parse(
    getSpendingSchema,
    input,
  ).getValueOrThrow();

  const result = await transactionsController.getSpendingByCategory(
    userId,
    new Date(dto.month),
  );

  return result.getValueOrThrow();
};

const getSpendingByCategoryAction = createAction(handler, [withAuth]);

export { getSpendingByCategoryAction };
