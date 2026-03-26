import { cookies } from 'next/headers';
import { cache } from 'react';

import { Result, UnauthorizedException } from '@/core/shared/domain';
import {
  IdentityController,
  identityController,
} from '@/core/modules/identity';

type ResolveCookies = typeof cookies;

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'auth_session';

const getUserSession =
  identityController.getUserSession.bind(identityController);

const getSessionCurry =
  (
    cookies: ResolveCookies,
    getUserSession: IdentityController['getUserSession'],
  ) =>
  async () => {
    const cookieStore = await cookies();

    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return Result.fail(new UnauthorizedException());

    return getUserSession(token);
  };

const setSessionCurry =
  (cookies: ResolveCookies) => async (sessionId: string) => {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: Number(process.env.SESSION_DURATION_SECONDS ?? 604800),
    });
  };

const getSession = cache(getSessionCurry(cookies, getUserSession));

const setSession = setSessionCurry(cookies);

export { getSession, setSession, getSessionCurry, setSessionCurry };
