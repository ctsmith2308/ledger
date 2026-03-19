import { Result, UnauthorizedException } from '@/core/shared/domain';
import { JoseJwtService } from '@/core/shared/infrastructure/services';
import { mapError } from '@/core/shared/infrastructure/mappers';
import { internalLogger } from '@/core/shared/infrastructure/loggers';
import { resolveTraceId } from '@/core/shared/infrastructure/utils';
import { CookieService } from '@/app/_lib/services/cookie';

import type { ActionResult } from './public-action';

type AuthUser = { id: string; email: string };

const _verifySession = async (): Promise<
  Result<AuthUser, UnauthorizedException>
> => {
  const cookieService = await CookieService.create();
  const token = cookieService.get('session');

  if (!token) return Result.fail(new UnauthorizedException());

  const serviceResult = JoseJwtService.create();

  if (serviceResult.isFailure) return Result.fail(new UnauthorizedException());

  const verifyResult = await serviceResult.value.verify(token);

  if (verifyResult.isFailure) return Result.fail(new UnauthorizedException());

  const { sub, email } = verifyResult.value;

  return Result.ok({ id: sub, email });
};

const protectedAction =
  <TOutput>(handler: (user: AuthUser) => Promise<TOutput>) =>
  async (): Promise<ActionResult<TOutput>> => {
    try {
      const sessionResult = (await _verifySession()).getValueOrThrow();

      return { success: true, data: await handler(sessionResult) };
    } catch (error: unknown) {
      const traceId = resolveTraceId(null);
      internalLogger(error, traceId);
      const { code, message } = mapError(error);
      return { success: false, code, message };
    }
  };

export { protectedAction };
export type { AuthUser };
