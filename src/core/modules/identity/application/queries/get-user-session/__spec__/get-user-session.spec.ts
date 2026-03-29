import { describe, it, expect, vi } from 'vitest';
import { GetUserSessionHandler } from '../get-user-session.handler';
import { GetUserSessionQuery } from '../get-user-session.query';
import {
  type IUserSessionRepository,
  SessionId,
  UserId,
  UserTier,
  UserSession,
} from '@/core/modules/identity/domain';
import {
  UnauthorizedException,
  SessionExpiredException,
  SessionRevokedException,
} from '@/core/shared/domain';

const _validSession = () =>
  UserSession.reconstitute(
    SessionId.from('session-abc'),
    UserId.from('user-12345'),
    UserTier.from('TRIAL'),
    new Date(Date.now() + 3600_000),
    undefined,
    new Date(),
  );

const _expiredSession = () =>
  UserSession.reconstitute(
    SessionId.from('session-abc'),
    UserId.from('user-12345'),
    UserTier.from('TRIAL'),
    new Date(Date.now() - 1000),
    undefined,
    new Date(Date.now() - 100_000),
  );

const _revokedSession = () =>
  UserSession.reconstitute(
    SessionId.from('session-abc'),
    UserId.from('user-12345'),
    UserTier.from('TRIAL'),
    new Date(Date.now() + 3600_000),
    new Date(),
    new Date(Date.now() - 100_000),
  );

const _makeHandler = (
  overrides: Partial<IUserSessionRepository> = {},
) => {
  const sessionRepository: IUserSessionRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(_validSession()),
    revokeById: vi.fn(),
    revokeAllForUser: vi.fn(),
    ...overrides,
  };

  const handler = new GetUserSessionHandler(sessionRepository);

  return { handler, sessionRepository };
};

describe('GetUserSessionHandler', () => {
  describe('success path', () => {
    it('returns the session for a valid token', async () => {
      const { handler } = _makeHandler();
      const query = new GetUserSessionQuery('session-abc');

      const result = await handler.execute(query);

      expect(result.isSuccess).toBe(true);
      expect(result.value.id.value).toBe('session-abc');
    });
  });

  describe('failure paths', () => {
    it('fails with UnauthorizedException for empty token', async () => {
      const { handler } = _makeHandler();
      const query = new GetUserSessionQuery('');

      const result = await handler.execute(query);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(UnauthorizedException);
    });

    it('fails with UnauthorizedException when session not found', async () => {
      const { handler } = _makeHandler({
        findById: vi.fn().mockResolvedValue(null),
      });
      const query = new GetUserSessionQuery('nonexistent-token');

      const result = await handler.execute(query);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(UnauthorizedException);
    });

    it('fails with SessionExpiredException for expired session', async () => {
      const { handler } = _makeHandler({
        findById: vi.fn().mockResolvedValue(_expiredSession()),
      });
      const query = new GetUserSessionQuery('session-abc');

      const result = await handler.execute(query);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(SessionExpiredException);
    });

    it('fails with SessionRevokedException for revoked session', async () => {
      const { handler } = _makeHandler({
        findById: vi.fn().mockResolvedValue(_revokedSession()),
      });
      const query = new GetUserSessionQuery('session-abc');

      const result = await handler.execute(query);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(SessionRevokedException);
    });
  });
});
