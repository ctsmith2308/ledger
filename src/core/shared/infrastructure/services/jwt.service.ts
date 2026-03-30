import { jwtVerify, SignJWT } from 'jose';

import { Result } from '../../domain/result';
import type {
  IJwtService,
  JwtData,
} from '../../domain/services/jwt.service.interface';
import { DomainException, InvalidJwtException } from '../../domain';

const envSecret = process.env.JWT_SECRET;

if (!envSecret) {
  throw new Error('FATAL: JWT_SECRET environment variable is not defined.');
}

const SECRET = new TextEncoder().encode(envSecret);

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL ?? '15m';

const JwtService: IJwtService = {
  async sign(payload: JwtData): Promise<Result<string, DomainException>> {
    try {
      const token = await new SignJWT({
        email: payload.email,
        tier: payload.tier,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(payload.userId)
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_TTL)
        .sign(SECRET);

      return Result.ok(token);
    } catch (error: unknown) {
      return Result.fail(new InvalidJwtException('Jwt sign failed'));
    }
  },

  async verify(token: string): Promise<Result<JwtData, DomainException>> {
    try {
      const { payload } = await jwtVerify(token, SECRET);

      if (
        typeof payload.sub !== 'string' ||
        typeof payload.email !== 'string' ||
        typeof payload.tier !== 'string'
      ) {
        throw new InvalidJwtException('Jwt verify failed');
      }

      return Result.ok({
        userId: payload.sub,
        email: payload.email,
        tier: payload.tier,
      });
    } catch (_error: unknown) {
      return Result.fail(new InvalidJwtException('Jwt verify failed'));
    }
  },
};

export { JwtService };
