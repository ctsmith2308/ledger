'use server';

import { identityModule, registerUserSchema } from '@/core/modules/indentity';
import { SchemaValidator } from '@/core/shared/infrastructure';
import { createAction } from '@/app/_lib';

const handler = async (input: unknown) => {
  const dto = SchemaValidator.parse(
    registerUserSchema,
    input,
  ).getValueOrThrow();

  const result = await identityModule.registerUser.execute(dto);

  return result.getValueOrThrow();
};

const registerAction = createAction({ handler });

export { registerAction };
