import { Result } from '../result';

type JwtPayload = {
  sub: string;
  email: string;
};

interface IJwtService {
  sign(payload: JwtPayload): Promise<Result<string, Error>>;
  verify(token: string): Promise<Result<JwtPayload, Error>>;
}

export type { IJwtService, JwtPayload };
