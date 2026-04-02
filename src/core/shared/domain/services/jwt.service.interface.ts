import { DomainException } from '../exceptions';
import { Result } from '../result';
import { type JwtType } from '../constants';

interface IJwtService {
  sign(sub: string, type: JwtType, ttl: string): Promise<Result<string, DomainException>>;
  verify(token: string, type: JwtType): Promise<Result<string, DomainException>>;
}

export type { IJwtService };
