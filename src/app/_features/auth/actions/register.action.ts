'use server';

import { identityController } from '@/core/modules/identity';
import {
  registerUserSchema,
  type RegisterUserInput,
} from '../schema/register.schema';
import {
  SchemaValidator,
  createAction,
  withRateLimit,
  type ActionCtx,
} from '@/app/_lib';

const handler = async (_ctx: ActionCtx, input: RegisterUserInput) => {
  const dto = SchemaValidator.parse(
    registerUserSchema,
    input,
  ).getValueOrThrow();

  const result = await identityController.registerUser(dto.email, dto.password);

  return result.getValueOrThrow();
};

const registerAction = createAction(handler, [withRateLimit]);

export { registerAction };
