import { jwtVerify, SignJWT } from 'jose';

import {
  JWT_TYPE,
  JWT_TTL,
  type JwtType,
  type JwtPayload,
  type IJwtService,
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
 * signAccess() and signChallenge() encapsulate type and TTL config.
 * Callers don't assemble signing params — they declare intent.
 *
 * verify() checks both the cryptographic signature and the type claim,
 * rejecting tokens that don't match the expected type. This prevents
 * challenge tokens from being used as access tokens.
 *
 * Throws InvalidJwtException on failure — callers handle the error
 * at their boundary (try/catch or handleServerError).
 */
const JwtService: IJwtService = {
  async signAccess(sub: string): Promise<string> {
    return sign(sub, JWT_TYPE.ACCESS, JWT_TTL.ACCESS);
  },

  async signChallenge(sub: string): Promise<string> {
    return sign(sub, JWT_TYPE.MFA_CHALLENGE, JWT_TTL.MFA_CHALLENGE);
  },

  async verify(token: string, type: JwtType): Promise<JwtPayload> {
    try {
      const { payload } = await jwtVerify(token, SECRET);

      if (typeof payload.sub !== 'string' || payload.type !== type) {
        throw new InvalidJwtException('Jwt verify failed');
      }

      return { sub: payload.sub };
    } catch (_error: unknown) {
      throw new InvalidJwtException('Jwt failed');
    }
  },
};

const sign = async (
  sub: string,
  type: JwtType,
  ttl: string,
): Promise<string> => {
  try {
    const token = await new SignJWT({ type })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(sub)
      .setIssuedAt()
      .setExpirationTime(ttl)
      .sign(SECRET);

    return token;
  } catch (_error: unknown) {
    throw new InvalidJwtException('Jwt sign failed');
  }
};

export { JwtService };
