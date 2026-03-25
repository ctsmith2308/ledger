'use server';

import { coreApi, RegisterUserInput, registerUserSchema } from '@/core';
import { SchemaValidator } from '@/core/shared/infrastructure';
import { createAction } from '@/app/_lib';

const handler = async (input: RegisterUserInput) => {
  const dto = SchemaValidator.parse(
    registerUserSchema,
    input,
  ).getValueOrThrow();

  const result = await coreApi.identity.registerUser(dto.email, dto.password);

  return result.getValueOrThrow();
};

const registerAction = createAction({ handler });

export { registerAction };
