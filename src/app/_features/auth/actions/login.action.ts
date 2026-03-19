'use server';

import { identityModule } from '@/core/modules/indentity/identity.module';
import {
  loginUserSchema,
  type LoginUserInput,
} from '@/core/modules/indentity/application/schema/login-user.schema';
import { publicAction } from '@/app/_lib/utils/public-action';
import { ZodValidator } from '@/core/shared/infrastructure';
import { CookieService } from '@/app/_lib/services/cookie';

const loginAction = publicAction(async (input: LoginUserInput) => {
  const dto = ZodValidator.create(loginUserSchema)
    .parse(input)
    .getValueOrThrow();

  const { jwt } = (await identityModule.loginUser.execute(dto)).getValueOrThrow();

  const cookieService = await CookieService.create();

  cookieService.set('session', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
});

export { loginAction };
