import { NextRequest, NextResponse } from 'next/server';

import { logger, resolveTraceId } from '@/core/shared/infrastructure';
import { SessionService } from './app/_lib';

export const proxy = async (req: NextRequest): Promise<NextResponse | null> => {
  const sessionToken = await SessionService.get(req);

  if (sessionToken.isFailure) {
    const traceId = resolveTraceId(req.headers.get('x-correlation-id'));

    logger.error(sessionToken.error, traceId);

    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: ['/dashboard/:path*'],
};
