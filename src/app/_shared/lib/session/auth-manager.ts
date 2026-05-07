import 'server-only';

import { cache } from 'react';

import {
  type DomainException,
  Result,
  UnauthorizedException,
  JWT_TYPE,
} from '@/core/shared/domain';

import { identityService } from '@/core/modules/identity';

import { JwtService } from '@/core/shared/infrastructure/services/jwt.service.impl';

import { CookieManager } from '@/app/_shared/lib/cookies';

import {
  ACCESS_TOKEN,
  SESSION_ID,
  ACCESS_TOKEN_OPTIONS,
  SESSION_ID_OPTIONS,
} from '@/app/_shared/config/auth.config';

// ─── Types ──────────────────────────────────────────────────────

type AuthSession = {
  userId: string;
  sessionId: string;
};

type RefreshSuccess = AuthSession & { accessToken: string };

// ─── Private ────────────────────────────────────────────────────

/**
 * Verifies the access token JWT. Returns a Result so the caller
 * can branch without catching — expired tokens fall through to
 * the refresh path instead of throwing.
 */
const validateToken = async (
  accessToken: string,
  sessionId: string,
): Promise<Result<AuthSession, DomainException>> => {
  try {
    const { sub } = await JwtService.verify(accessToken, JWT_TYPE.ACCESS);

    return Result.ok({ userId: sub, sessionId });
  } catch (error) {
    return Result.fail(error as DomainException);
  }
};

/**
 * Attempts a session refresh via the identity service. The service
 * validates the session in Postgres, signs a new access token, and
 * returns the confirmed session data. Returns a Result so the caller
 * can throw a consistent UnauthorizedException on failure.
 */
const refreshToken = async (
  sessionId: string,
): Promise<Result<RefreshSuccess, DomainException>> => {
  try {
    const refreshResult =
      await identityService.refreshSession(sessionId);

    return Result.ok({
      userId: refreshResult.userId,
      sessionId: refreshResult.sessionId,
      accessToken: refreshResult.accessToken,
    });
  } catch (error) {
    return Result.fail(error as DomainException);
  }
};

// ─── Public ─────────────────────────────────────────────────────

/**
 * Auth session manager. Provides the server-side session lifecycle
 * for pages and server actions.
 *
 * - getSession: resolves the authenticated user from cookies.
 *   Verifies the access token JWT, falls back to refresh if expired,
 *   and throws UnauthorizedException when both fail. Wrapped in
 *   React.cache() to deduplicate within a single request.
 *
 * - setSession: writes both auth cookies (access token + session ID).
 *   Called by login and MFA verify actions after successful auth.
 *
 * - revokeSession: clears both auth cookies. Called by logout and
 *   delete account actions after revoking the session in Postgres.
 *
 * The proxy (middleware) does NOT use this — it reads from
 * request.cookies and calls JwtService.verify() directly for
 * lightweight route gating.
 */
const AuthManager = {
  getSession: cache(async (): Promise<AuthSession> => {
    const accessToken = await CookieManager.get(ACCESS_TOKEN);
    const sessionId = await CookieManager.get(SESSION_ID);

    if (!sessionId) throw new UnauthorizedException();

    if (accessToken) {
      const tokenResult = await validateToken(accessToken, sessionId);

      if (tokenResult.isSuccess) return tokenResult.value;
    }

    const refreshResult = await refreshToken(sessionId);

    if (refreshResult.isSuccess) {
      const { accessToken: newToken, userId, sessionId: confirmedSessionId } =
        refreshResult.value;

      await AuthManager.setSession(newToken, confirmedSessionId);

      return { userId, sessionId: confirmedSessionId };
    }

    throw new UnauthorizedException();
  }),

  async setSession(accessToken: string, sessionId: string): Promise<void> {
    await CookieManager.set(ACCESS_TOKEN, accessToken, ACCESS_TOKEN_OPTIONS);

    await CookieManager.set(SESSION_ID, sessionId, SESSION_ID_OPTIONS);
  },

  async revokeSession(): Promise<void> {
    await CookieManager.remove(ACCESS_TOKEN);

    await CookieManager.remove(SESSION_ID);
  },
};

export { AuthManager, type AuthSession };
