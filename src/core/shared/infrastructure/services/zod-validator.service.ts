import { z } from 'zod';

import { ValidationException } from '@/core/shared/domain';
import { IValidator } from '@/core/shared/domain/services/validator.service.interface';

class ZodValidator<T> implements IValidator<T> {
  constructor(private schema: z.Schema<T>) {}

  parse(data: unknown): T {
    const result = this.schema.safeParse(data);

    if (!result.success) {
      throw new ValidationException(z.prettifyError(result.error));
    }

    return result.data;
  }
}

export { ZodValidator };
