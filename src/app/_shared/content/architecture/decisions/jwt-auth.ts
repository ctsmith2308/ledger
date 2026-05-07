import { type ArchitectureDecision } from '../types';

const jwtAuth: ArchitectureDecision = {
  slug: 'jwt-auth',
  title: 'JWT authentication with refresh flow',
  subtitle:
    'Short-lived JWTs carry only userId. A session ID cookie enables token refresh without re-authentication.',
  badge: 'Security',
  context:
    'The original session architecture used opaque tokens stored in the database. Every request required a database round-trip to validate the session. JWT authentication moves validation to a local signature check with zero I/O. A refresh flow backed by Postgres sessions ensures users stay authenticated without re-entering credentials every 15 minutes.',
  decision:
    'Short-lived JWT access tokens (15 minutes) for stateless per-request verification. A separate httpOnly session ID cookie serves as the refresh token, mapped to a UserSession record in Postgres. The proxy (Next.js middleware) owns both validation and refresh — when the access token expires, the proxy validates the session in Postgres and issues a new access token, setting the cookie on the response and forwarding userId/sessionId via request headers. AuthManager.getSession() reads the forwarded headers as a trusted, zero-I/O operation. This split exists because Next.js server components cannot set cookies.',
  rationale: [
    'The proxy runs on every protected route. A database lookup per request adds latency before the page starts streaming. JWT signature verification is sub-millisecond with zero I/O.',
    'The JWT payload carries only userId in the sub claim. No email, no tier, no permissions. Data that can change is queried when needed via getUserAccount(), so the token never goes stale.',
    'IJwtService exposes signAccess(sub) and signChallenge(sub). Callers declare intent, not signing params. Type and TTL are encapsulated in the implementation.',
    'The service layer (IdentityService) owns all token signing. Handlers create sessions and return domain data. The service signs tokens as part of the DTO mapping.',
    'Session creation happens in the login and MFA verify handlers. The session ID is returned to the service layer for inclusion in the response DTO. The action sets both cookies via AuthManager.setSession().',
    'MFA two-step login: password verified, service signs a challenge token (5m TTL), client stores it in sessionStorage, user enters TOTP, handler creates a session, service signs an access token. Same signAccess/signChallenge interface handles both steps.',
  ],
  tradeoffs: [
    {
      pro: 'Zero database I/O for authentication on every request. Proxy, server actions, and server components all validate locally.',
      con: 'JWTs cannot be revoked mid-flight. A compromised token is valid until expiry (15 minutes). Revoking the session in Postgres blocks future refresh attempts but does not kill active access tokens.',
    },
    {
      pro: 'Minimal payload (userId only) means the token never carries data that can go stale. No tier drift, no email mismatch.',
      con: 'Every request that needs email, tier, or mfaEnabled has to query the database. Acceptable because these reads are scoped to specific pages and actions, not every route.',
    },
    {
      pro: 'Refresh flow keeps users authenticated seamlessly. The 15-minute access token expiry is invisible to the user.',
      con: 'Refresh adds a Postgres lookup once every 15 minutes per active user. Sub-millisecond on a primary key lookup, but it is a database dependency on the refresh path.',
    },
  ],
  codeBlocks: [
    {
      label: 'IJwtService. Intent-based signing',
      code: `interface IJwtService {
  signAccess(sub: string): Promise<string>;
  signChallenge(sub: string): Promise<string>;
  verify(token: string, type: JwtType): Promise<JwtPayload>;
}

// Throws InvalidJwtException on failure.
// Callers handle at their boundary (try/catch or handleServerError).`,
    },
    {
      label: 'Proxy. Validation, refresh, and header forwarding',
      code: `// Owns JWT validation and refresh. Forwards auth context
// via request headers so server components read without I/O.
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN)?.value;
  const sessionId = request.cookies.get(SESSION_ID)?.value;

  if (!sessionId) return redirectToLogin(request);

  if (token) {
    const verifyResult = await verifyToken(token);
    if (verifyResult.isSuccess)
      return forwardAuth(request, verifyResult.value, sessionId);
  }

  // Token missing or invalid — attempt refresh
  const refreshResult = await refreshToken(sessionId);
  if (refreshResult.isFailure) return redirectToLogin(request);

  const { userId, accessToken } = refreshResult.value;
  const response = forwardAuth(request, userId, sessionId);
  response.cookies.set({ name: ACCESS_TOKEN, value: accessToken, ...ACCESS_TOKEN_OPTIONS });
  return response;
}`,
    },
    {
      label: 'AuthManager. Trusted header read for server context',
      code: `// getSession: reads forwarded headers from proxy. No verification.
const { userId, sessionId } = await AuthManager.getSession();

// setSession: login/MFA actions set both cookies
await AuthManager.setSession(accessToken, sessionId);

// revokeSession: logout/delete actions clear both cookies
await AuthManager.revokeSession();`,
    },
    {
      label: 'Login handler. Session creation on SUCCESS',
      code: `// Handler authenticates, creates session, returns claims
user.loggedIn();

const sessionId = SessionId.from(this.idGenerator.generate());
const session = UserSession.create(sessionId, userId);
await this.sessionRepository.save(session);

return Result.ok({ type: 'SUCCESS', user, sessionId: sessionId.value });

// Service signs the token and maps to DTO
const token = await this.jwtService.signAccess(userId);
return LoginMapper.toSuccessDTO(token, loginResult.sessionId);`,
    },
  ],
};

export { jwtAuth };
