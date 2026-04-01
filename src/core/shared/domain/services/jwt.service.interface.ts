import { DomainException } from '../exceptions';
import { Result } from '../result';

interface IJwtService {
  sign(sub: string, purpose: string, ttl: string): Promise<Result<string, DomainException>>;
  verify(token: string, purpose: string): Promise<Result<string, DomainException>>;
}

export type { IJwtService };
