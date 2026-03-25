import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { Result, UnauthorizedException } from '@/core/shared/domain';
import { coreApi, type SessionDTO } from '@/core';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'auth_session';

type AuthContext = NextRequest | undefined;

const SessionService = {
  async get(ctx?: AuthContext) {
    let cookieStore;

    if (ctx) {
      cookieStore = ctx.cookies;
    } else {
      cookieStore = await cookies();
    }

    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return Result.fail(new UnauthorizedException());

    return coreApi.identity.getUserSession(token);
  },

  async set(sessionId: string) {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Number(process.env.SESSION_DURATION_SECONDS ?? 604800),
    });
  },

  async delete() {
    const cookieStore = await cookies();

    cookieStore.delete(SESSION_COOKIE_NAME);
  },
};

export { SessionService, type SessionDTO };
