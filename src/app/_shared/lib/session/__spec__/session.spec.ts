import { describe, it, expect, vi } from 'vitest';

vi.mock('@/core/shared/infrastructure', () => ({
  JwtService: { sign: vi.fn(), verify: vi.fn() },
}));

vi.mock('@/core/shared/domain', () => ({
  UnauthorizedException: class extends Error {},
}));

import { getCookieCurry, setCookieCurry } from '../session.service';

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

describe('getCookieCurry', () => {
  it('returns token when cookie exists', async () => {
    const { resolveCookies } = _makeCookieStore('valid-token');

    const getCookie = getCookieCurry(resolveCookies);
    const token = await getCookie();

    expect(token).toBe('valid-token');
  });

  it('returns null when no cookie', async () => {
    const { resolveCookies } = _makeCookieStore(undefined);

    const getCookie = getCookieCurry(resolveCookies);
    const token = await getCookie();

    expect(token).toBeNull();
  });
});

describe('setCookieCurry', () => {
  it('sets the session cookie with correct options', async () => {
    const { store, resolveCookies } = _makeCookieStore();

    const setCookie = setCookieCurry(resolveCookies);
    await setCookie('new-session-id');

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
