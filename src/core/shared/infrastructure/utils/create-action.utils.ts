import { Result } from '@/core/shared/domain';
import { HttpErrorResponse } from '../mappers';
import { ActionContext, ActionFn, Middleware } from './action.types';
import { withLogger } from './with-logger.middleware';

const createAction = <TRequest, TValue>(
  handler: { execute: (req: TRequest) => Promise<Result<TValue, Error>> },
  ...middlewares: Middleware<TValue>[]
) => {
  const base: ActionFn<TValue> = async (body, _ctx) => {
    const result = await handler.execute(body as TRequest);
    const value = result.getValueOrThrow();
    return Result.ok(value);
  };

  const composed = [withLogger<TValue>(), ...middlewares].reduceRight(
    (next, mw) => mw.handle(next),
    base,
  );

  return (
    body: unknown,
    headers: Headers = new Headers(),
  ): Promise<Result<TValue, HttpErrorResponse>> => {
    const ctx: ActionContext = { headers };
    return composed(body, ctx);
  };
};

export { createAction };
