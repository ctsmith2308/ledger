import { describe, it, expect, vi } from 'vitest';

import { type IEventBus } from '@/core/shared/domain';

import {
  type IUserRepository,
  type IUserSessionRepository,
  UserId,
  Email,
  Password,
  UserTier,
  User,
  AccountDeletedEvent,
} from '@/core/modules/identity/domain';

import { CleanupExpiredTrialsHandler } from '../cleanup-expired-trials.handler';
import { CleanupExpiredTrialsCommand } from '../cleanup-expired-trials.command';

const _trialUser = (id: string) =>
  User.reconstitute(
    UserId.from(id),
    Email.from(`${id}@example.com`),
    Password.fromHash('hash'),
    UserTier.from('TRIAL'),
    false,
  );

const _makeHandler = (
  overrides: {
    userRepository?: Partial<IUserRepository>;
    sessionRepository?: Partial<IUserSessionRepository>;
    eventBus?: Partial<IEventBus>;
  } = {},
) => {
  const userRepository: IUserRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    deleteById: vi.fn(),
    findExpiredTrialUsers: vi.fn().mockResolvedValue([]),
    ...overrides.userRepository,
  };

  const sessionRepository: IUserSessionRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    revokeById: vi.fn(),
    revokeAllForUser: vi.fn(),
    ...overrides.sessionRepository,
  };

  const eventBus: IEventBus = {
    dispatch: vi.fn().mockResolvedValue(undefined),
    register: vi.fn(),
    ...overrides.eventBus,
  };

  const handler = new CleanupExpiredTrialsHandler(
    userRepository,
    sessionRepository,
    eventBus,
  );

  return { handler, userRepository, sessionRepository, eventBus };
};

describe('CleanupExpiredTrialsHandler', () => {
  const command = new CleanupExpiredTrialsCommand();

  describe('no expired users', () => {
    it('returns zero deleted', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual({ deleted: 0, total: 0 });
    });

    it('does not revoke sessions or delete users', async () => {
      const { handler, sessionRepository, userRepository } = _makeHandler();

      await handler.execute();

      expect(sessionRepository.revokeAllForUser).not.toHaveBeenCalled();
      expect(userRepository.deleteById).not.toHaveBeenCalled();
    });

    it('does not dispatch events', async () => {
      const { handler, eventBus } = _makeHandler();

      await handler.execute();

      expect(eventBus.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('with expired users', () => {
    const expiredUsers = [_trialUser('user-1'), _trialUser('user-2')];

    const withExpired = () => ({
      userRepository: {
        findExpiredTrialUsers: vi.fn().mockResolvedValue(expiredUsers),
      },
    });

    it('returns correct deleted count', async () => {
      const { handler } = _makeHandler(withExpired());

      const result = await handler.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual({ deleted: 2, total: 2 });
    });

    it('revokes sessions for each expired user', async () => {
      const { handler, sessionRepository } = _makeHandler(withExpired());

      await handler.execute();

      expect(sessionRepository.revokeAllForUser).toHaveBeenCalledTimes(2);
      expect(sessionRepository.revokeAllForUser).toHaveBeenCalledWith(
        expiredUsers[0].id,
      );
      expect(sessionRepository.revokeAllForUser).toHaveBeenCalledWith(
        expiredUsers[1].id,
      );
    });

    it('deletes each expired user', async () => {
      const { handler, userRepository } = _makeHandler(withExpired());

      await handler.execute();

      expect(userRepository.deleteById).toHaveBeenCalledTimes(2);
      expect(userRepository.deleteById).toHaveBeenCalledWith(
        expiredUsers[0].id,
      );
      expect(userRepository.deleteById).toHaveBeenCalledWith(
        expiredUsers[1].id,
      );
    });

    it('dispatches AccountDeletedEvent for each user', async () => {
      const { handler, eventBus } = _makeHandler(withExpired());

      await handler.execute();

      expect(eventBus.dispatch).toHaveBeenCalledTimes(2);

      const firstCall = (eventBus.dispatch as ReturnType<typeof vi.fn>).mock
        .calls[0][0];
      const secondCall = (eventBus.dispatch as ReturnType<typeof vi.fn>).mock
        .calls[1][0];

      expect(firstCall).toHaveLength(1);
      expect(firstCall[0]).toBeInstanceOf(AccountDeletedEvent);
      expect(firstCall[0].aggregateId).toBe('user-1');

      expect(secondCall).toHaveLength(1);
      expect(secondCall[0]).toBeInstanceOf(AccountDeletedEvent);
      expect(secondCall[0].aggregateId).toBe('user-2');
    });

    it('revokes sessions before deleting user', async () => {
      const callOrder: string[] = [];

      const { handler } = _makeHandler({
        userRepository: {
          findExpiredTrialUsers: vi
            .fn()
            .mockResolvedValue([_trialUser('user-1')]),
          deleteById: vi.fn().mockImplementation(() => {
            callOrder.push('delete');
            return Promise.resolve();
          }),
        },
        sessionRepository: {
          revokeAllForUser: vi.fn().mockImplementation(() => {
            callOrder.push('revoke');
            return Promise.resolve();
          }),
        },
      });

      await handler.execute();

      expect(callOrder).toEqual(['revoke', 'delete']);
    });
  });
});
