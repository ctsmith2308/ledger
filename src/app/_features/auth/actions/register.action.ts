'use server';

import { commandBus, registerUserSchema, RegisterUserCommand } from '@/core/modules/indentity';
import { SchemaValidator } from '@/core/shared/infrastructure';
import { createAction } from '@/app/_lib';

const handler = async (input: unknown) => {
  const dto = SchemaValidator.parse(registerUserSchema, input).getValueOrThrow();

  const result = await commandBus.dispatch(new RegisterUserCommand(dto.email, dto.password));

  return result.getValueOrThrow();
};

const registerAction = createAction({ handler });

export { registerAction };
