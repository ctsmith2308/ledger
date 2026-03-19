import { z } from 'zod';

import {
  DomainException,
  Result,
  ValidationException,
} from '@/core/shared/domain';

const SchemaValidator = {
  parse<T>(schema: z.ZodType<T>, data: unknown): Result<T, DomainException> {
    const result = schema.safeParse(data);

    return result.success
      ? Result.ok(result.data)
      : Result.fail(new ValidationException(z.prettifyError(result.error)));
  },
};

export { SchemaValidator };
