import { NextRequest, NextResponse } from 'next/server';

import { internalLogger } from '@/core/shared/infrastructure/loggers';
import { resolveTraceId } from '@/core/shared/infrastructure/utils';
import { JoseJwtService } from '@/core/shared/infrastructure/services';

type ProxyFn = (req: NextRequest) => Promise<NextResponse | null>;

const _isProtected = (pathname: string) => pathname.startsWith('/dashboard');

const _pipe =
  (...fns: ProxyFn[]) =>
  async (req: NextRequest): Promise<NextResponse> => {
    for (const fn of fns) {
      const result = await fn(req);
      if (result) return result;
    }
    return NextResponse.next();
  };

const _withAuth = async (req: NextRequest): Promise<NextResponse | null> => {
  if (!_isProtected(req.nextUrl.pathname)) return null;

  const traceId = resolveTraceId(req.headers.get('x-correlation-id'));

  const token = req.cookies.get('session')?.value;

  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  const serviceResult = JoseJwtService.create();

  if (serviceResult.isFailure) {
    internalLogger(serviceResult.error, traceId);

    return NextResponse.redirect(new URL('/login', req.url));
  }

  const verifyResult = await serviceResult.value.verify(token);

  if (verifyResult.isFailure) {
    internalLogger(verifyResult.error, traceId);

    return NextResponse.redirect(new URL('/login', req.url));
  }

  return null;
};

export const proxy = _pipe(_withAuth);

export const config = {
  matcher: ['/dashboard/:path*'],
};
