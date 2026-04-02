import { jwtVerify, SignJWT } from 'jose';

import {
  Result,
  type JwtType,
  type IJwtService,
  DomainException,
  InvalidJwtException,
} from '../../domain';

const envSecret = process.env.JWT_SECRET;

if (!envSecret) {
  throw new Error('FATAL: JWT_SECRET environment variable is not defined.');
}

const SECRET = new TextEncoder().encode(envSecret);

const JwtService: IJwtService = {
  async sign(
    sub: string,
    type: JwtType,
    ttl: string,
  ): Promise<Result<string, DomainException>> {
    try {
      const token = await new SignJWT({ type })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(sub)
        .setIssuedAt()
        .setExpirationTime(ttl)
        .sign(SECRET);

      return Result.ok(token);
    } catch (_error: unknown) {
      return Result.fail(new InvalidJwtException('Jwt sign failed'));
    }
  },

  async verify(
    token: string,
    type: JwtType,
  ): Promise<Result<string, DomainException>> {
    try {
      const { payload } = await jwtVerify(token, SECRET);

      if (typeof payload.sub !== 'string' || payload.type !== type) {
        throw new InvalidJwtException('Jwt verify failed');
      }

      return Result.ok(payload.sub);
    } catch (_error: unknown) {
      return Result.fail(new InvalidJwtException('Jwt verify failed'));
    }
  },
};

export { JwtService };
