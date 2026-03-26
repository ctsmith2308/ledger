import { describe, it, expect, vi } from 'vitest';
import { Result, UnauthorizedException } from '@/core/shared/domain';

vi.mock('@/core/modules/identity', () => ({
  identityController: { getUserSession: vi.fn() },
  IdentityController: {},
}));

import { getSessionCurry, setSessionCurry } from '../session.service';

const _makeCookieStore = (token?: string) => {
  const store = {
    get: vi.fn().mockReturnValue(
      token ? { name: 'auth_session', value: token } : undefined,
    ),
    set: vi.fn(),
    delete: vi.fn(),
  };

  const resolveCookies = vi.fn().mockResolvedValue(store);

  return { store, resolveCookies };
};

const _makeGetUserSession = (returnValue?: unknown) =>
  vi.fn().mockResolvedValue(
    returnValue ??
      Result.ok({ sessionId: 'session-123', userId: 'user-123' }),
  );

describe('getSessionCurry', () => {
  it('returns session when cookie exists and is valid', async () => {
    const getUserSession = _makeGetUserSession();
    const { resolveCookies } = _makeCookieStore('valid-token');

    const getSession = getSessionCurry(resolveCookies, getUserSession);
    const result = await getSession();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual({
      sessionId: 'session-123',
      userId: 'user-123',
    });
    expect(getUserSession).toHaveBeenCalledWith('valid-token');
  });

  it('returns UnauthorizedException when no cookie', async () => {
    const getUserSession = _makeGetUserSession();
    const { resolveCookies } = _makeCookieStore(undefined);

    const getSession = getSessionCurry(resolveCookies, getUserSession);
    const result = await getSession();

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnauthorizedException);
    expect(getUserSession).not.toHaveBeenCalled();
  });

  it('delegates to getUserSession for validation', async () => {
    const getUserSession = _makeGetUserSession(
      Result.fail(new UnauthorizedException()),
    );
    const { resolveCookies } = _makeCookieStore('expired-token');

    const getSession = getSessionCurry(resolveCookies, getUserSession);
    const result = await getSession();

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnauthorizedException);
  });
});

describe('setSessionCurry', () => {
  it('sets the session cookie with correct options', async () => {
    const { store, resolveCookies } = _makeCookieStore();

    const setSession = setSessionCurry(resolveCookies);
    await setSession('new-session-id');

    expect(store.set).toHaveBeenCalledWith(
      'auth_session',
      'new-session-id',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      }),
    );
  });
});
