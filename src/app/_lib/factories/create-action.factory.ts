import { toErrorResponse } from '@/core/shared/infrastructure';
import { logger } from '@/core/shared/infrastructure';
import { JwtData } from '@/core/shared/domain';
import { SessionService, RateLimitService } from '../services';

type ActionSuccess<T> = { success: true; data: T };
type ActionFailure = { success: false; code: string; message: string };
type ActionResult<T> = ActionSuccess<T> | ActionFailure;

type BaseConfig = {
  rateLimit?: boolean;
};

type ProtectedConfig<TInput, TOutput> = BaseConfig & {
  protected: true;
  handler: (session: JwtData, input: TInput) => Promise<TOutput>;
};

type UnprotectedConfig<TInput, TOutput> = BaseConfig & {
  protected?: false;
  handler: (input: TInput) => Promise<TOutput>;
};

const createAction = <TInput, TOutput>(
  config: ProtectedConfig<TInput, TOutput> | UnprotectedConfig<TInput, TOutput>,
) => {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      if (config.protected) {
        const sessionToken = await SessionService.get();

        const session = sessionToken.getValueOrThrow();

        if (config.rateLimit) {
          const rateLimitResult = await RateLimitService.checkLimit(session.sub);

          rateLimitResult.getValueOrThrow();
        }

        const data = await config.handler(session, input);

        return { success: true, data };
      }

      if (config.rateLimit) {
        const rateLimitResult = await RateLimitService.checkLimit();

        rateLimitResult.getValueOrThrow();
      }

      const data = await config.handler(input);

      return { success: true, data };
    } catch (err: unknown) {
      logger.error(err);

      const { code, message } = toErrorResponse(err);

      return { success: false, code, message };
    }
  };
};

export {
  createAction,
  type ActionResult,
  type ActionSuccess,
  type ActionFailure,
};
