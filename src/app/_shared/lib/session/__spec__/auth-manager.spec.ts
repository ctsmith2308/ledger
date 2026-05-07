import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

vi.mock('react', () => ({
  cache: (fn: Function) => fn,
}));

import { UnauthorizedException, JWT_TYPE } from '@/core/shared/domain';

vi.mock('@/app/_shared/lib/cookies', () => ({
  CookieManager: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

vi.mock('@/core/shared/infrastructure/services/jwt.service.impl', () => ({
  JwtService: {
    verify: vi.fn(),
    signAccess: vi.fn(),
    signChallenge: vi.fn(),
  },
}));

vi.mock('@/core/modules/identity', () => ({
  identityService: {
    refreshSession: vi.fn(),
  },
}));

import { CookieManager } from '@/app/_shared/lib/cookies';

import { JwtService } from '@/core/shared/infrastructure/services/jwt.service.impl';

import { identityService } from '@/core/modules/identity';

import { AuthManager } from '../auth-manager';

const mockCookieManager = vi.mocked(CookieManager);
const mockJwtService = vi.mocked(JwtService);
const mockIdentityService = vi.mocked(identityService);

describe('AuthManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSession', () => {
    it('returns userId and sessionId when access token is valid', async () => {
      mockCookieManager.get
        .mockResolvedValueOnce('valid-token')
        .mockResolvedValueOnce('session-123');

      mockJwtService.verify.mockResolvedValue({ sub: 'user-456' });

      const result = await AuthManager.getSession();

      expect(result).toEqual({ userId: 'user-456', sessionId: 'session-123' });
    });

    it('calls refresh when access token verification fails', async () => {
      mockCookieManager.get
        .mockResolvedValueOnce('expired-token')
        .mockResolvedValueOnce('session-123');

      mockJwtService.verify.mockRejectedValue(new Error('expired'));

      mockIdentityService.refreshSession.mockResolvedValue({
        accessToken: 'new-token',
        userId: 'user-456',
        sessionId: 'session-123',
      });

      const result = await AuthManager.getSession();

      expect(mockIdentityService.refreshSession).toHaveBeenCalledWith(
        'session-123',
      );

      expect(result).toEqual({ userId: 'user-456', sessionId: 'session-123' });
    });

    it('sets new cookies after successful refresh', async () => {
      mockCookieManager.get
        .mockResolvedValueOnce('expired-token')
        .mockResolvedValueOnce('session-123');

      mockJwtService.verify.mockRejectedValue(new Error('expired'));

      mockIdentityService.refreshSession.mockResolvedValue({
        accessToken: 'new-token',
        userId: 'user-456',
        sessionId: 'session-123',
      });

      await AuthManager.getSession();

      expect(mockCookieManager.set).toHaveBeenCalledTimes(2);
    });

    it('throws UnauthorizedException when no sessionId cookie', async () => {
      mockCookieManager.get
        .mockResolvedValueOnce('some-token')
        .mockResolvedValueOnce(null);

      await expect(AuthManager.getSession()).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when refresh fails', async () => {
      mockCookieManager.get
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('session-123');

      mockIdentityService.refreshSession.mockRejectedValue(
        new UnauthorizedException(),
      );

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
