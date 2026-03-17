import { Result, ValidationException } from '@/core/shared/domain';

interface IValidator<T> {
  validate(data: unknown): Result<T, ValidationException>;
}

export type { IValidator };
