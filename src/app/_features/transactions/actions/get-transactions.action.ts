'use server';

import { transactionsController } from '@/core/modules/transactions';
import {
  createAction,
  withAuth,
  type ActionCtx,
  type AuthContext,
} from '@/app/_lib';

const handler = async (ctx: ActionCtx, _input: void) => {
  const { userId } = ctx as AuthContext;

  const result = await transactionsController.getTransactions(userId);

  return result.getValueOrThrow();
};

const getTransactionsAction = createAction(handler, [withAuth]);

export { getTransactionsAction };
