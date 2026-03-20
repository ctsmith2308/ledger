import { NextRequest, NextResponse } from 'next/server';

import { logger, resolveTraceId, JwtService } from '@/core/shared/infrastructure';

export const proxy = async (req: NextRequest): Promise<NextResponse | null> => {
  const token = req.cookies.get('session')?.value;

  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  const jwtVerifyResult = await JwtService.verify(token);

  if (jwtVerifyResult.isFailure) {
    const traceId = resolveTraceId(req.headers.get('x-correlation-id'));

    logger.error(jwtVerifyResult.error, traceId);

    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/dashboard/:path*'],
};
