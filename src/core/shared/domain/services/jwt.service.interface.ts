import { type JwtType } from '../constants';

type JwtPayload = {
  sub: string;
};

interface IJwtService {
  signAccess(sub: string): Promise<string>;
  signChallenge(sub: string): Promise<string>;
  verify(token: string, type: JwtType): Promise<JwtPayload>;
}

export type { IJwtService, JwtPayload };
