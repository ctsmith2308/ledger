import { NextRequest, NextResponse } from 'next/server';

import { JWT_TYPE } from '@/core/shared/domain';
import { JwtService } from '@/core/shared/infrastructure/services/jwt.service.impl';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'auth_session';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const result = await JwtService.verify(token, JWT_TYPE.ACCESS);

  if (result.isFailure) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/overview/:path*', '/spending-habits/:path*', '/transactions/:path*', '/budgets/:path*', '/accounts/:path*', '/settings/:path*'],
};
