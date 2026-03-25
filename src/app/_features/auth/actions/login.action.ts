'use server';

import { identityController } from '@/core/modules/identity';

import {
  SchemaValidator,
  withRateLimit,
  createAction,
  type ActionCtx,
} from '@/app/_lib';

import { LoginUserInput, loginUserSchema } from '../schema/login.schema';
import { setSession } from '@/app/_lib/services/session.service';

const handler = async (_ctx: ActionCtx, input: LoginUserInput) => {
  const dto = SchemaValidator.parse(loginUserSchema, input).getValueOrThrow();

  const result = await identityController.loginUser(dto.email, dto.password);

  const { sessionId } = result.getValueOrThrow();

  await setSession(sessionId);
};

const loginAction = createAction(handler, [withRateLimit]);

export { loginAction };
