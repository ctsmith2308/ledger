import { Result } from '@/core/shared/domain';
import { internalLogger } from '../loggers';
import { toErrorMap } from '../mappers';
import { resolveTraceId } from './correlation-id-generator.util';
import { ActionFn, Middleware } from './action.types';

const withLogger = <TValue>(): Middleware<TValue> => ({
  handle(next: ActionFn<TValue>): ActionFn<TValue> {
    return async (body, ctx) => {
      try {
        return await next(body, ctx);
      } catch (error: unknown) {
        const traceId = resolveTraceId(
          ctx.headers.get('x-correlation-id'),
        );

        internalLogger(error, traceId);

        return Result.fail(toErrorMap(error));
      }
    };
  },
});

export { withLogger };
