import { jwtVerify, SignJWT } from 'jose';

import { Result } from '../../domain/result';
import type { IJwtService, JwtPayload } from '../../domain/services/jwt.service.interface';

class JoseJwtService implements IJwtService {
  private constructor(private readonly secret: Uint8Array) {}

  static create(): Result<JoseJwtService, Error> {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return Result.fail(new Error('JWT_SECRET is not configured.'));
    }

    return Result.ok(new JoseJwtService(new TextEncoder().encode(secret)));
  }

  async sign(payload: JwtPayload): Promise<Result<string, Error>> {
    try {
      const token = await new SignJWT({ email: payload.email })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(payload.sub)
        .setIssuedAt()
        .sign(this.secret);

      return Result.ok(token);
    } catch (error: unknown) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async verify(token: string): Promise<Result<JwtPayload, Error>> {
    try {
      const { payload } = await jwtVerify(token, this.secret);

      if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
        return Result.fail(new Error('Invalid JWT payload.'));
      }

      return Result.ok({ sub: payload.sub, email: payload.email as string });
    } catch (error: unknown) {
      return Result.fail(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

export { JoseJwtService };
