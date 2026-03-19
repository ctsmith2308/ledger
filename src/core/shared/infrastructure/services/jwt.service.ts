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

/**
 * TODO: JwtService Enhancements
 *
 * [ ] Security: Add `.setExpirationTime('2h')` to the `sign` method.
 * [ ] Testing: Create `vitest.setup.ts` (or jest.setup.ts) to define `process.env.JWT_SECRET`.
 * [ ] Testing: Write unit tests for `sign` and `verify` success cases.
 * [ ] Testing: Write unit test for `verify` with an expired or malformed token.
 * [ ] Validation: Add a Zod/Joi schema check inside `verify` for the `JwtPayload` shape.
 * [ ] Optional: Add `.setAudience()` or `.setIssuer()` if required by your domain.
 */
const JwtService: IJwtService = {
  async sign(payload: JwtData): Promise<Result<string, DomainException>> {
    try {
      const token = await new SignJWT({ email: payload.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(payload.sub)
        .setIssuedAt()
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
        typeof payload.email !== 'string'
      ) {
        throw new InvalidJwtException('Jwt verify failed');
      }

      return Result.ok({ sub: payload.sub, email: payload.email });
    } catch (_error: unknown) {
      return Result.fail(new InvalidJwtException('Jwt verify failed'));
    }
  },
};

export { JwtService };
