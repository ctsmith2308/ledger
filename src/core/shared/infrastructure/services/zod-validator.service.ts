import { z } from 'zod';
import { IValidator } from '@/core/shared/domain/services/validator.service.interface';
import { Result, ValidationException } from '@/core/shared/domain';
import { ActionFn } from '../utils/action.types';
import { toErrorMap } from '../mappers';

class ZodValidator<T> implements IValidator<T> {
  constructor(private schema: z.Schema<T>) {}

  validate(data: unknown): Result<T, ValidationException> {
    const result = this.schema.safeParse(data);

    return result.success
      ? Result.ok(result.data)
      : Result.fail(new ValidationException(z.prettifyError(result.error)));
  }

  handle<TValue>(next: ActionFn<TValue>): ActionFn<TValue> {
    return async (body, ctx) => {
      try {
        const data = this.validate(body).getValueOrThrow();

        return next(data, ctx);
      } catch (error: unknown) {
        return Result.fail(toErrorMap(error));
      }
    };
  }
}

export { ZodValidator };
