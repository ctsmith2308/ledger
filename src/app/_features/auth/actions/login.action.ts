'use server';

import {
  commandBus,
  loginUserSchema,
  LoginUserCommand,
} from '@/core/modules/identity';
import { SchemaValidator } from '@/core/shared/infrastructure';
import { SessionService, createAction } from '@/app/_lib';

const handler = async (input: unknown) => {
  const dto = SchemaValidator.parse(loginUserSchema, input).getValueOrThrow();

  const result = await commandBus.dispatch(
    new LoginUserCommand(dto.email, dto.password),
  );

  const { jwt } = result.getValueOrThrow();

  SessionService.set(jwt);
};

const loginAction = createAction({ handler });

export { loginAction };
