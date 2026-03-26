import { toErrorResponse, logger } from '@/core/shared/infrastructure';
import { getSession, checkRateLimit } from '../services';

type ActionSuccess<T> = { success: true; data: T };
type ActionFailure = { success: false; code: string; message: string };
type ActionResult<T> = ActionSuccess<T> | ActionFailure;

type PublicContext = Record<string, never>;
type AuthContext = { userId: string };

type ActionCtx = PublicContext | AuthContext;

type Middleware = (ctx: ActionCtx) => Promise<ActionCtx>;

const withAuth: Middleware = async (ctx) => {
  const result = await getSession();

  const session = result.getValueOrThrow();

  return { ...ctx, userId: session.userId };
};

const withRateLimit: Middleware = async (ctx) => {
  const result = await checkRateLimit();

  result.getValueOrThrow();

  return { ...ctx };
};

const createAction = <TInput, TOutput>(
  handler: (ctx: ActionCtx, input: TInput) => Promise<TOutput>,
  middleware: Middleware[] = [],
) => {
  return async (input: TInput): Promise<ActionResult<TOutput>> => {
    try {
      let ctx: ActionCtx = {};

      for (const fn of middleware) {
        ctx = await fn(ctx);
      }

      const data = await handler(ctx, input);

      return { success: true, data };
    } catch (err: unknown) {
      logger.error(err);

      const { code, message } = toErrorResponse(err);

      return { success: false, code, message };
    }
  };
};

export {
  withAuth,
  withRateLimit,
  createAction,
  type ActionCtx,
  type AuthContext,
  type ActionResult,
  type ActionSuccess,
  type ActionFailure,
  type Middleware,
};
