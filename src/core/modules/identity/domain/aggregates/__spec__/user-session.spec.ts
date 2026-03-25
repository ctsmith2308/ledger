import { describe, it, expect, vi, afterEach } from 'vitest';
import { UserSession } from '../user-session.aggregate';
import { SessionId, UserId } from '../../value-objects';

const _makeSession = () => {
  const sessionId = SessionId.from('session-123');
  const userId = UserId.from('user-12345');
  return UserSession.create(sessionId, userId);
};

describe('UserSession', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('create', () => {
    it('creates a valid session with expiration in the future', () => {
      const session = _makeSession();

      expect(session.id.value).toBe('session-123');
      expect(session.userId.value).toBe('user-12345');
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(session.revokedAt).toBeUndefined();
      expect(session.createdAt).toBeInstanceOf(Date);
    });

    it('is valid when freshly created', () => {
      const session = _makeSession();

      expect(session.isValid).toBe(true);
      expect(session.isExpired).toBe(false);
      expect(session.isRevoked).toBe(false);
    });
  });

  describe('revoke', () => {
    it('marks the session as revoked', () => {
      const session = _makeSession();

      session.revoke();

      expect(session.isRevoked).toBe(true);
      expect(session.isValid).toBe(false);
      expect(session.revokedAt).toBeInstanceOf(Date);
    });
  });

  describe('isExpired', () => {
    it('returns true when current time is past expiration', () => {
      const sessionId = SessionId.from('session-123');
      const userId = UserId.from('user-12345');

      const session = UserSession.reconstitute(
        sessionId,
        userId,
        new Date(Date.now() - 1000),
        undefined,
        new Date(Date.now() - 100000),
      );

      expect(session.isExpired).toBe(true);
      expect(session.isValid).toBe(false);
    });
  });

  describe('reconstitute', () => {
    it('rebuilds a session without side effects', () => {
      const sessionId = SessionId.from('s-1');
      const userId = UserId.from('user-12345');
      const expiresAt = new Date('2030-01-01');
      const createdAt = new Date('2025-01-01');

      const session = UserSession.reconstitute(
        sessionId,
        userId,
        expiresAt,
        undefined,
        createdAt,
      );

      expect(session.id.value).toBe('s-1');
      expect(session.expiresAt).toBe(expiresAt);
      expect(session.createdAt).toBe(createdAt);
      expect(session.pullDomainEvents()).toHaveLength(0);
    });
  });
});
