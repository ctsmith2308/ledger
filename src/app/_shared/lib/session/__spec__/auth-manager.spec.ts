import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('react', () => ({
  cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}));

import { UnauthorizedException } from '@/core/shared/domain';

const mockHeaderStore = new Map<string, string>();

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: (name: string) => mockHeaderStore.get(name) ?? null,
  })),
}));

vi.mock('@/app/_shared/lib/cookies', () => ({
  CookieManager: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

import { CookieManager } from '@/app/_shared/lib/cookies';

import { AuthManager } from '../auth-manager';

const mockCookieManager = vi.mocked(CookieManager);

describe('AuthManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHeaderStore.clear();
  });

  describe('getSession', () => {
    it('returns userId and sessionId from forwarded headers', async () => {
      mockHeaderStore.set('x-user-id', 'user-456');
      mockHeaderStore.set('x-session-id', 'session-123');

      const result = await AuthManager.getSession();

      expect(result).toEqual({
        userId: 'user-456',
        sessionId: 'session-123',
      });
    });

    it('throws UnauthorizedException when x-user-id header is missing', async () => {
      mockHeaderStore.set('x-session-id', 'session-123');

      await expect(AuthManager.getSession()).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when x-session-id header is missing', async () => {
      mockHeaderStore.set('x-user-id', 'user-456');

      await expect(AuthManager.getSession()).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when no headers are present', async () => {
      await expect(AuthManager.getSession()).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('setSession', () => {
    it('sets both cookies', async () => {
      await AuthManager.setSession('token-abc', 'session-xyz');

      expect(mockCookieManager.set).toHaveBeenCalledTimes(2);

      expect(mockCookieManager.set).toHaveBeenCalledWith(
        'access_token',
        'token-abc',
        expect.objectContaining({ httpOnly: true }),
      );

      expect(mockCookieManager.set).toHaveBeenCalledWith(
        'session_id',
        'session-xyz',
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });

  describe('revokeSession', () => {
    it('removes both cookies', async () => {
      await AuthManager.revokeSession();

      expect(mockCookieManager.remove).toHaveBeenCalledTimes(2);

      expect(mockCookieManager.remove).toHaveBeenCalledWith('access_token');

      expect(mockCookieManager.remove).toHaveBeenCalledWith('session_id');
    });
  });
});
