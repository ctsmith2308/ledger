'use server';

import { identityController } from '@/core/modules/identity';
import { SchemaValidator, SessionService, createAction } from '@/app/_lib';
import { loginUserSchema } from '../schema/login.schema';

const handler = async (input: unknown) => {
  const dto = SchemaValidator.parse(loginUserSchema, input).getValueOrThrow();

  const result = await identityController.loginUser(dto.email, dto.password);

  const { sessionId } = result.getValueOrThrow();

  await SessionService.set(sessionId);
};

const loginAction = createAction({ handler, rateLimit: true });

export { loginAction };
