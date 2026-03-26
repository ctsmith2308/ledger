'use server';

import { bankingController } from '@/core/modules/banking';
import {
  createAction,
  withAuth,
  type ActionCtx,
  type AuthContext,
} from '@/app/_lib';

const handler = async (ctx: ActionCtx, _input: void) => {
  const { userId } = ctx as AuthContext;

  const result = await bankingController.getAccounts(userId);

  return result.getValueOrThrow();
};

const getAccountsAction = createAction(handler, [withAuth]);

export { getAccountsAction };
