import { Result } from '../result';
import { DomainException } from '../exceptions';

interface IValidator {
  parse<T>(validator: unknown, data: unknown): Result<T, DomainException>;
}

export type { IValidator };
