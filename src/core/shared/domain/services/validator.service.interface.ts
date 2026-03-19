import { Result } from '../result';
import { DomainException } from '../exceptions';

interface IValidator<T> {
  parse(data: unknown): Result<T, DomainException>;
}

export type { IValidator };
