import { type ArchitectureDecision } from '../types';

const jwtAuth: ArchitectureDecision = {
  slug: 'jwt-auth',
  title: 'JWT authentication',
  subtitle:
    'Short-lived JWTs carry only userId. A type claim separates access tokens from MFA challenge tokens without multiple signing keys.',
  badge: 'Security',
  context:
    'The original session architecture used opaque tokens stored in the database. Every request (page load, mutation, middleware check) required a database round-trip to validate the session. For a server-rendered Next.js app where the proxy runs on every protected route, that meant a DB query before the page even started rendering. JWT authentication moves validation to a signature check with zero I/O.',
  decision:
    'Replace opaque session tokens with short-lived JWT access tokens (15 minutes). The JWT carries only userId in the sub claim, nothing else. The proxy validates the signature and type via jose, no database hit. Server actions validate the same way via withAuth middleware, passing { userId } in context. A second type (`JWT_TYPE.MFA_CHALLENGE`, 5 minutes) supports the two-step MFA login flow without a separate token service. Application state (email, tier, mfaEnabled) is queried via getUserAccount(), not cached in the token.',
  rationale: [
    'The proxy runs on every protected route. A database lookup per request adds latency before the page starts streaming. JWT signature verification is sub-millisecond with zero I/O.',
    'The JWT payload carries only userId in the sub claim. No email, no tier, no permissions. Data that can change is queried when needed via getUserAccount(), so the token never goes stale.',
    'IJwtService exposes two methods, `sign(sub, type, ttl)` and `verify(token, type)`, both returning `Result<string>`. A single interface handles access tokens and MFA challenge tokens by varying the type and TTL arguments. No token-specific methods, no payload types, no generics.',
    'The service layer (IdentityService) owns all token signing. Handlers never touch JWT directly. They return domain aggregates, and the service signs tokens as part of the DTO mapping.',
    'MFA two-step login: password verified, service signs a challenge token (`JWT_TYPE.MFA_CHALLENGE`, 5m TTL), client stores it in sessionStorage, user enters TOTP, service verifies the challenge token and signs an access token (`JWT_TYPE.ACCESS`, 15m TTL). The same sign/verify interface handles both steps.',
  ],
  tradeoffs: [
    {
      pro: 'Zero database I/O for authentication on every request. Proxy, server actions, and server components all validate locally.',
      con: 'JWTs cannot be revoked mid-flight. A compromised token is valid until expiry (15 minutes). Instant revocation would require a Redis blacklist checked in the proxy.',
    },
    {
      pro: 'Minimal payload (userId only) means the token never carries data that can go stale. No tier drift, no email mismatch.',
      con: 'Every request that needs email, tier, or mfaEnabled has to query the database. Acceptable because these reads are scoped to specific pages and actions, not every route.',
    },
    {
      pro: 'Short expiry (15 minutes) limits the window for compromised tokens. Type-based signing prevents challenge tokens from being used as access tokens.',
      con: 'Without a refresh flow, users re-authenticate every 15 minutes. Acceptable for a portfolio project, not for a production app with active sessions.',
    },
  ],
  codeBlocks: [
    {
      label: 'IJwtService. Type-based sign and verify',
      code: `// Both methods return Result<string>
interface IJwtService {
  sign(
    sub: string,
    type: string,
    ttl: string,
  ): Promise<Result<string, DomainException>>;

  verify(
    token: string,
    type: string,
  ): Promise<Result<string, DomainException>>;
}

// Implementation via jose
const JwtService: IJwtService = {
  async sign(sub, type, ttl) {
    const token = await new SignJWT({ type })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(sub)
      .setIssuedAt()
      .setExpirationTime(ttl)
      .sign(SECRET);

    return Result.ok(token);
  },

  async verify(token, type) {
    const { payload } = await jwtVerify(token, SECRET);

    if (payload.type !== type) {
      return Result.fail(new InvalidTokenException());
    }

    return Result.ok(payload.sub);
  },
};`,
    },
    {
      label: 'Proxy and withAuth. Verify with JWT_TYPE.ACCESS',
      code: `// Proxy. Runs before every matched route
const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
const result = await JwtService.verify(token, JWT_TYPE.ACCESS);

// withAuth middleware. Passes userId in context
const result = await JwtService.verify(token, JWT_TYPE.ACCESS);
const userId = result.getValueOrThrow();
return { ctx: { userId } };

// loadSession. React.cache for server components
const loadSession = cache(async () => {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) throw new UnauthorizedException();
  const result = await JwtService.verify(token, JWT_TYPE.ACCESS);
  return { userId: result.getValueOrThrow() };
});`,
    },
    {
      label: 'MFA two-step login. Challenge then access',
      code: `// Step 1: password verified, service signs challenge token
const challengeToken = await this.jwtService.sign(
  user.id.value,
  JWT_TYPE.MFA_CHALLENGE,
  '5m',
);
// Client stores challengeToken in sessionStorage

// Step 2: TOTP verified, service verifies challenge and signs access
const sub = await this.jwtService.verify(challengeToken, JWT_TYPE.MFA_CHALLENGE);
// ... validate TOTP ...
const accessToken = await this.jwtService.sign(sub.value, JWT_TYPE.ACCESS, '15m');
// Set accessToken in httpOnly cookie`,
    },
    {
      label: 'Production hardening. Documented upgrade path',
      code: `// Today: JWT expires, proxy redirects, user re-authenticates
// Gaps documented, not overlooked:
//
// 1. Redis session validation: UserSession aggregate already exists
//    with create/revoke lifecycle. When Redis is added, the proxy
//    checks a session blacklist before accepting the JWT signature.
//
// 2. Refresh flow: store refresh token in second httpOnly cookie,
//    POST /api/auth/refresh validates session in DB, signs new JWT.
//
// 3. Claims hardening: add iss (issuer) and aud (audience) to
//    prevent token reuse across services.`,
    },
  ],
};

export { jwtAuth };
