'use server';

import { budgetsController } from '@/core/modules/budgets';
import {
  SchemaValidator,
  createAction,
  withAuth,
  type ActionCtx,
  type AuthContext,
} from '@/app/_lib';
import {
  createBudgetSchema,
  type CreateBudgetInput,
} from '../schema/create-budget.schema';

const handler = async (ctx: ActionCtx, input: CreateBudgetInput) => {
  const { userId } = ctx as AuthContext;

  const dto = SchemaValidator.parse(
    createBudgetSchema,
    input,
  ).getValueOrThrow();

  const result = await budgetsController.createBudget(
    userId,
    dto.category,
    dto.monthlyLimit,
  );

  return result.getValueOrThrow();
};

const createBudgetAction = createAction(handler, [withAuth]);

export { createBudgetAction };
