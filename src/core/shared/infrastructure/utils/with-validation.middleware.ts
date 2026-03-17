import { IValidator } from '@/core/shared/domain';
import { Result } from '@/core/shared/domain';
import { toErrorMap } from '../mappers';
import { ActionFn, Middleware } from './action.types';

const withValidation = <TValue, TRequest>(
  validator: IValidator<TRequest>,
): Middleware<TValue> => ({
  handle(next: ActionFn<TValue>): ActionFn<TValue> {
    return async (body, ctx) => {
      try {
        const data = validator.validate(body).getValueOrThrow();
        return next(data, ctx);
      } catch (error: unknown) {
        // TODO: NEED TO log all unknown errors!!!!

        return Result.fail(toErrorMap(error));
      }
    };
  },
});

export { withValidation };
