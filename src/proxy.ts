import { NextRequest, NextResponse } from 'next/server';

import { type DomainException, Result, JWT_TYPE } from '@/core/shared/domain';

import { identityService } from '@/core/modules/identity';

import { JwtService } from '@/core/shared/infrastructure/services/jwt.service.impl';

import {
  ACCESS_TOKEN,
  ACCESS_TOKEN_OPTIONS,
  AUTH_HEADERS,
  SESSION_ID,
} from '@/app/_shared/config/auth.config';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN)?.value;
  const sessionId = request.cookies.get(SESSION_ID)?.value;

  if (!sessionId) {
    return redirectToLogin(request);
  }

  // Token exists — verify it
  if (token) {
    const verifyResult = await verifyToken(token);

    if (verifyResult.isSuccess) {
      return forwardAuth(request, verifyResult.value, sessionId);
    }
  }

  // Token missing or invalid — attempt refresh
  const refreshResult = await refreshToken(sessionId);

  if (refreshResult.isFailure) {
    return redirectToLogin(request);
  }

  const { userId, accessToken } = refreshResult.value;
  const response = forwardAuth(request, userId, sessionId);

  response.cookies.set({
    name: ACCESS_TOKEN,
    value: accessToken,
    ...ACCESS_TOKEN_OPTIONS,
  });

  return response;
}

const verifyToken = async (
  accessToken: string,
): Promise<Result<string, DomainException>> => {
  try {
    const { sub } = await JwtService.verify(accessToken, JWT_TYPE.ACCESS);

    return Result.ok(sub);
  } catch (error) {
    return Result.fail(error as DomainException);
  }
};

const refreshToken = async (
  sessionId: string,
): Promise<
  Result<{ userId: string; accessToken: string }, DomainException>
> => {
  try {
    const result = await identityService.refreshSession(sessionId);

    return Result.ok({
      userId: result.userId,
      accessToken: result.accessToken,
    });
  } catch (error) {
    return Result.fail(error as DomainException);
  }
};

const forwardAuth = (
  request: NextRequest,
  userId: string,
  sessionId: string,
): NextResponse => {
  const requestHeaders = new Headers(request.headers);

  requestHeaders.delete(AUTH_HEADERS.USER_ID);
  requestHeaders.delete(AUTH_HEADERS.SESSION_ID);

  requestHeaders.set(AUTH_HEADERS.USER_ID, userId);
  requestHeaders.set(AUTH_HEADERS.SESSION_ID, sessionId);

  return NextResponse.next({ request: { headers: requestHeaders } });
};

const redirectToLogin = (request: NextRequest) => {
  const response = NextResponse.redirect(new URL('/login', request.url));

  response.cookies.delete(ACCESS_TOKEN);

  response.cookies.delete(SESSION_ID);

  return response;
};

export const config = {
  matcher: [
    '/overview/:path*',
    '/spending-habits/:path*',
    '/transactions/:path*',
    '/budgets/:path*',
    '/accounts/:path*',
    '/settings/:path*',
  ],
};
