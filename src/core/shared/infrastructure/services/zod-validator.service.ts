import { z } from 'zod';

import {
  DomainException,
  Result,
  ValidationException,
} from '@/core/shared/domain';
import { IValidator } from '@/core/shared/domain/services/validator.service.interface';

class ZodValidator<T> implements IValidator<T> {
  private constructor(private readonly schema: z.Schema<T>) {}

  static create<T>(schema: z.Schema<T>): ZodValidator<T> {
    return new ZodValidator(schema);
  }

  parse(data: unknown): Result<T, DomainException> {
    const result = this.schema.safeParse(data);

    return result.success
      ? Result.ok(result.data)
      : Result.fail(new ValidationException(z.prettifyError(result.error)));
  }
}

export { ZodValidator };
