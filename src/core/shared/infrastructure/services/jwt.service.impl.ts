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

/**
 * JWT signing and verification via jose (HS256).
 * https://github.com/panva/jose
 *
 * Payload carries only userId (sub) and a type discriminator (access vs
 * mfa_challenge). No email, tier, or permissions. Data that can change
 * is queried at runtime via getUserAccount(), keeping the token
 * stateless and free of stale claims.
 *
 * verify() checks both the cryptographic signature and the type claim,
 * rejecting tokens that don't match the expected type. This prevents
 * challenge tokens from being used as access tokens.
 */
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
