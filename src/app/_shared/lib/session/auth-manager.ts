import 'server-only';

import { cache } from 'react';
import { headers } from 'next/headers';

import { UnauthorizedException } from '@/core/shared/domain';

import { CookieManager } from '@/app/_shared/lib/cookies';

import {
  ACCESS_TOKEN,
  AUTH_HEADERS,
  SESSION_ID,
  ACCESS_TOKEN_OPTIONS,
  SESSION_ID_OPTIONS,
} from '@/app/_shared/config/auth.config';

type AuthSession = {
  userId: string;
  sessionId: string;
};

/**
 * Auth session manager. Provides the server-side session lifecycle
 * for pages and server actions.
 *
 * - getSession: reads auth context from request headers forwarded
 *   by the proxy (middleware). The proxy owns validation and refresh;
 *   this is a trusted read. Wrapped in React.cache() to deduplicate
 *   within a single request.
 *
 * - setSession: writes both auth cookies (access token + session ID).
 *   Called by login and MFA verify actions after successful auth.
 *
 * - revokeSession: clears both auth cookies. Called by logout and
 *   delete account actions after revoking the session in Postgres.
 *
 * IMPORTANT!
 * Cookies can only be modified via server actions or route handlers.
 * https://nextjs.org/docs/app/api-reference/functions/cookies#understanding-cookie-behavior-in-server-components
 */
const AuthManager = {
  getSession: cache(async (): Promise<AuthSession> => {
    const headerStore = await headers();
    const userId = headerStore.get(AUTH_HEADERS.USER_ID);
    const sessionId = headerStore.get(AUTH_HEADERS.SESSION_ID);

    if (!userId || !sessionId) {
      throw new UnauthorizedException();
    }

    return { userId, sessionId };
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
