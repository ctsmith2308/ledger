import { DomainException } from '../exceptions';
import { Result } from '../result';

type JwtData = {
  userId: string;
  email: string;
  tier: string;
};

interface IJwtService {
  sign(payload: JwtData): Promise<Result<string, DomainException>>;
  verify(token: string): Promise<Result<JwtData, DomainException>>;
}

export type { IJwtService, JwtData };
