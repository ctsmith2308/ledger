import { type ArchitectureDecision } from '../types';

const jwtAuth: ArchitectureDecision = {
  slug: 'jwt-auth',
  title: 'JWT authentication — stateless access, stateful refresh',
  subtitle:
    'Short-lived JWTs eliminate per-request database lookups. The gaps are deliberate scope decisions, not architectural oversights.',
  badge: 'Security',
  context:
    'The original session architecture used opaque tokens stored in the database. Every request — page load, mutation, middleware check — required a database round-trip to validate the session. For a server-rendered Next.js app where the proxy runs on every protected route, this meant a DB query before the page even started rendering. JWT authentication moves validation to a signature check with zero I/O.',
  decision:
    'Replace opaque session tokens with short-lived JWT access tokens (15 minutes). The JWT carries userId, email, and tier in the payload. The proxy validates the signature via jose — no database hit. Server actions validate the same way via withAuth middleware. The session table remains for refresh tokens, but the refresh flow is not yet implemented — token expiry redirects to login.',
  rationale: [
    'The proxy runs on every protected route. A database lookup per request adds latency before the page starts streaming. JWT signature verification is sub-millisecond with zero I/O.',
    'The JWT payload carries the minimum data needed for authorization decisions — userId for data scoping, tier for feature gating, email for display. No sensitive data, no permissions list, no role hierarchy.',
    'JwtService is a plain object implementing IJwtService — sign and verify. The proxy imports it directly from the file path to avoid pulling Prisma through the barrel. withAuth and loadSession use the same service through the infrastructure barrel.',
    'The session table stores refresh tokens (opaque session IDs). When the refresh flow is built, the client sends the refresh token to get a new JWT without re-authenticating. The session can be revoked in the database, killing the refresh path.',
  ],
  tradeoffs: [
    {
      pro: 'Zero database I/O for authentication on every request. Proxy, server actions, and server components all validate locally.',
      con: 'JWTs cannot be revoked mid-flight. A compromised token is valid until expiry (15 minutes). Instant revocation requires a Redis blacklist checked in the proxy.',
    },
    {
      pro: 'The payload is self-contained — no join, no lookup, no cache. The proxy decodes and has everything it needs.',
      con: "Payload data can go stale. If a user's tier changes, the JWT still carries the old tier until it expires and is re-signed.",
    },
    {
      pro: 'Short expiry (15 minutes) limits the window for stale data and compromised tokens.',
      con: 'Without a refresh flow, users re-authenticate every 15 minutes. Acceptable for a portfolio project, not for a production app with active sessions.',
    },
  ],
  codeBlocks: [
    {
      label: 'JwtService — sign and verify with jose',
      code: `const JwtService: IJwtService = {
  async sign(payload: JwtData): Promise<Result<string, DomainException>> {
    const token = await new SignJWT({
      email: payload.email,
      tier: payload.tier,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.userId)
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(SECRET);

    return Result.ok(token);
  },

  async verify(token: string): Promise<Result<JwtData, DomainException>> {
    const { payload } = await jwtVerify(token, SECRET);
    return Result.ok({
      userId: payload.sub,
      email: payload.email,
      tier: payload.tier,
    });
  },
};`,
    },
    {
      label: 'Proxy — validates JWT on every protected route',
      code: `// src/proxy.ts — runs before every matched route
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const result = await JwtService.verify(token);

  if (result.isFailure) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/overview/:path*', '/transactions/:path*', '/budgets/:path*',
            '/accounts/:path*', '/settings/:path*'],
};`,
    },
    {
      label: 'Production hardening — documented upgrade path',
      code: `// Today: JWT expires → proxy redirects → user re-authenticates
// Gaps documented, not overlooked:
//
// 1. Refresh flow: store refresh token in second httpOnly cookie,
//    POST /api/auth/refresh validates session in DB, signs new JWT.
//    User stays logged in for session lifetime (7 days) without
//    re-entering credentials.
//
// 2. Instant revocation: Redis blacklist checked in proxy.
//    On password change or account compromise, add userId to Redis
//    with TTL matching JWT expiry. Proxy checks blacklist before
//    accepting the JWT signature.
//
// 3. Token rotation on sensitive actions: password change, tier
//    upgrade, email change — re-sign JWT with updated payload,
//    replace the cookie in the response.
//
// 4. Claims hardening: add iss (issuer) and aud (audience) to
//    prevent token reuse across services.`,
    },
  ],
};

export { jwtAuth };
