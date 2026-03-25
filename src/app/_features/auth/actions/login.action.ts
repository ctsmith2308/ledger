'use server';

import { coreApi, loginUserSchema } from '@/core';
import { SchemaValidator } from '@/core/shared/infrastructure';
import { SessionService, createAction } from '@/app/_lib';

const handler = async (input: unknown) => {
  const dto = SchemaValidator.parse(loginUserSchema, input).getValueOrThrow();

  const result = await coreApi.identity.loginUser(dto.email, dto.password);

  const { sessionId } = result.getValueOrThrow();

  await SessionService.set(sessionId);
};

const loginAction = createAction({ handler });

export { loginAction };
