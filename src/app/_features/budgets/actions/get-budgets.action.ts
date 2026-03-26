'use server';

import { budgetsController } from '@/core/modules/budgets';
import {
  createAction,
  withAuth,
  type ActionCtx,
  type AuthContext,
} from '@/app/_lib';

const handler = async (ctx: ActionCtx, _input: void) => {
  const { userId } = ctx as AuthContext;

  const result = await budgetsController.getBudgets(userId);

  return result.getValueOrThrow();
};

const getBudgetsAction = createAction(handler, [withAuth]);

export { getBudgetsAction };
