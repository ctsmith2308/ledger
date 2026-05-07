import { describe, it, expect, vi } from 'vitest';

import { RefreshSessionHandler } from '../refresh-session.handler';
import { RefreshSessionCommand } from '../refresh-session.command';

import {
  type IUserSessionRepository,
  UserSession,
  SessionId,
  UserId,
} from '@/core/modules/identity/domain';

import { UnauthorizedException } from '@/core/shared/domain';

const _validSession = () =>
  UserSession.reconstitute(
    SessionId.from('session-123'),
    UserId.from('user-456'),
    new Date(Date.now() + 3600000),
    undefined,
    new Date(),
  );

const _revokedSession = () =>
  UserSession.reconstitute(
    SessionId.from('session-123'),
    UserId.from('user-456'),
    new Date(Date.now() + 3600000),
    new Date(),
    new Date(),
  );

const _expiredSession = () =>
  UserSession.reconstitute(
    SessionId.from('session-123'),
    UserId.from('user-456'),
    new Date(Date.now() - 1000),
    undefined,
    new Date(),
  );

const _makeHandler = (overrides: {
  sessionRepository?: Partial<IUserSessionRepository>;
} = {}) => {
  const sessionRepository: IUserSessionRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(_validSession()),
    revokeById: vi.fn(),
    revokeAllForUser: vi.fn(),
    ...overrides.sessionRepository,
  };

  const handler = new RefreshSessionHandler(sessionRepository);

  return { handler, sessionRepository };
};

describe('RefreshSessionHandler', () => {
  const command = new RefreshSessionCommand('session-123');

  it('returns the session when valid', async () => {
    const { handler } = _makeHandler();

    const result = await handler.execute(command);

    expect(result.isSuccess).toBe(true);
    expect(result.value.userId.value).toBe('user-456');
  });

  it('fails when session is not found', async () => {
    const { handler } = _makeHandler({
      sessionRepository: {
        findById: vi.fn().mockResolvedValue(null),
      },
    });

    const result = await handler.execute(command);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnauthorizedException);
  });

  it('fails when session is revoked', async () => {
    const { handler } = _makeHandler({
      sessionRepository: {
        findById: vi.fn().mockResolvedValue(_revokedSession()),
      },
    });

    const result = await handler.execute(command);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnauthorizedException);
  });

  it('fails when session is expired', async () => {
    const { handler } = _makeHandler({
      sessionRepository: {
        findById: vi.fn().mockResolvedValue(_expiredSession()),
      },
    });

    const result = await handler.execute(command);

    expect(result.isFailure).toBe(true);
    expect(result.error).toBeInstanceOf(UnauthorizedException);
  });
});
