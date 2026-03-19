'use server';

import { identityModule, loginUserSchema } from '@/core/modules/indentity';
import { SchemaValidator } from '@/core/shared/infrastructure';
import { SessionService, createAction } from '@/app/_lib';

const handler = async (input: unknown) => {
  const dto = SchemaValidator.parse(loginUserSchema, input).getValueOrThrow();

  const result = await identityModule.loginUser.execute(dto);
  const { jwt } = result.getValueOrThrow();

  SessionService.set(jwt);
};

const loginAction = createAction({ handler });

export { loginAction };
