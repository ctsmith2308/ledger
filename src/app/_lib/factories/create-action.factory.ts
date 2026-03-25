import { toErrorResponse } from '@/core/shared/infrastructure';
import { logger } from '@/core/shared/infrastructure';
import { SessionService, RateLimitService } from '../services';

type ActionSuccess<T> = { success: true; data: T };
type ActionFailure = { success: false; code: string; message: string };
type ActionResult<T> = ActionSuccess<T> | ActionFailure;

type BaseConfig = {
  rateLimit?: boolean;
};

type ProtectedConfig<TSession extends { userId: string }, TInput, TOutput> = BaseConfig & {
  protected: true;
  handler: (session: TSession, input: TInput) => Promise<TOutput>;
};

type UnprotectedConfig<TInput, TOutput> = BaseConfig & {
  protected?: false;
  handler: (input: TInput) => Promise<TOutput>;
};

const createAction = <TSession extends { userId: string }, TInput, TOutput>(
  config:
    | ProtectedConfig<TSession, TInput, TOutput>
    | UnprotectedConfig<TInput, TOutput>,
) => {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      if (config.protected) {
        const sessionToken = await SessionService.get();

        const session = sessionToken.getValueOrThrow() as unknown as TSession;

        if (config.rateLimit) {
          const rateLimitResult = await RateLimitService.checkLimit(
            session.userId,
          );

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
