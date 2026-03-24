import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { Result, UnauthorizedException } from '@/core/shared/domain';
import { JwtService } from '@/core/shared/infrastructure';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'auth_session';

type AuthContext = NextRequest | undefined;

const SessionService = {
  async get(ctx?: AuthContext) {
    let cookieStore;

    if (ctx) {
      // We are in Middleware (ie. proxy.ts) Middlware only has access to request not server side cookies() method.
      cookieStore = ctx.cookies;
    } else {
      // We are in a Server Component, Server Action, or Route Handler
      // In Next.js 15, this must be awaited
      cookieStore = await cookies();
    }

    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return Result.fail(new UnauthorizedException());

    return await JwtService.verify(token);
  },

  async set(token: string) {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // Set this to match your JWT expiry (e.g., 7 days)
      maxAge: 60 * 60 * 24 * 7,
    });
  },

  async delete() {
    const cookieStore = await cookies();

    cookieStore.delete(SESSION_COOKIE_NAME);
  },
};

export { SessionService };
