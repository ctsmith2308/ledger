'use server';

import { identityModule } from '@/core/modules/indentity/identity.module';
import {
  registerUserSchema,
  type RegisterUserInput,
} from '@/core/modules/indentity/application/schema';
import { publicAction } from '@/app/_lib/utils/public-action';
import { ZodValidator } from '@/core/shared/infrastructure';

const registerAction = publicAction(async (input: RegisterUserInput) => {
  const dto = ZodValidator.create(registerUserSchema)
    .parse(input)
    .getValueOrThrow();

  return (await identityModule.registerUser.execute(dto)).getValueOrThrow();
});

export { registerAction };
