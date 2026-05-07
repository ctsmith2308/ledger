import { NextRequest, NextResponse } from 'next/server';

import { JWT_TYPE } from '@/core/shared/domain';

import { JwtService } from '@/core/shared/infrastructure/services/jwt.service.impl';

import {
  ACCESS_TOKEN,
  SESSION_ID,
} from '@/app/_shared/config/auth.config';

export async function proxy(request: NextRequest) {
  try {
    const token = request.cookies.get(ACCESS_TOKEN)?.value;

    if (!token) {
      return redirectToLogin(request);
    }

    await JwtService.verify(token, JWT_TYPE.ACCESS);

    return NextResponse.next();
  } catch {
    return redirectToLogin(request);
  }
}

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
