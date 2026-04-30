import { NextRequest, NextResponse } from 'next/server';

import { JWT_TYPE } from '@/core/shared/domain';
import { JwtService } from '@/core/shared/infrastructure/services/jwt.service.impl';

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'auth_session';

/**
 * TODO: Session revocation is not enforced here. The proxy verifies the
 * JWT signature and expiry but does not check whether the session has
 * been revoked in the database. A logged-out user's token remains valid
 * until it expires. The fix is to check a Redis session blacklist on
 * every request, populated on logout/password change. The UserSession
 * aggregate and revokeById/revokeAllForUser methods already exist.
 * See: docs/upstash.md roadmap section.
 */
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
