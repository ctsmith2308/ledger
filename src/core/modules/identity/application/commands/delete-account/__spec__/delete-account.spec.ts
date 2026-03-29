import { describe, it, expect, vi } from 'vitest';
import { DeleteAccountHandler } from '../delete-account.handler';
import { DeleteAccountCommand } from '../delete-account.command';
import {
  type IUserRepository,
  type IUserSessionRepository,
  UserId,
  Email,
  User,
  Password,
} from '@/core/modules/identity/domain';
import { type IEventBus } from '@/core/shared/domain';

const _makeHandler = (overrides: {
  userRepository?: Partial<IUserRepository>;
  sessionRepository?: Partial<IUserSessionRepository>;
  eventBus?: Partial<IEventBus>;
} = {}) => {
  const userRepository: IUserRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(_existingUser()),
    findByEmail: vi.fn(),
    deleteById: vi.fn(),
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
    dispatch: vi.fn(),
    register: vi.fn(),
    ...overrides.eventBus,
  };

  const handler = new DeleteAccountHandler(userRepository, sessionRepository, eventBus);

  return { handler, userRepository, sessionRepository, eventBus };
};

const _existingUser = () =>
  User.reconstitute(
    UserId.from('user-1'),
    Email.from('test@example.com'),
    Password.fromHash('hash'),
    false,
  );

describe('DeleteAccountHandler', () => {
  const validCommand = new DeleteAccountCommand('user-1');

  describe('success path', () => {
    it('revokes all sessions before deleting', async () => {
      const { handler, sessionRepository } = _makeHandler();

      await handler.execute(validCommand);

      expect(sessionRepository.revokeAllForUser).toHaveBeenCalledTimes(1);
    });

    it('deletes the user', async () => {
      const { handler, userRepository } = _makeHandler();

      await handler.execute(validCommand);

      expect(userRepository.deleteById).toHaveBeenCalledTimes(1);
    });

    it('returns success', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('user not found', () => {
    it('fails when user does not exist', async () => {
      const { handler } = _makeHandler({
        userRepository: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isFailure).toBe(true);
    });

    it('does not attempt deletion when user not found', async () => {
      const { handler, userRepository } = _makeHandler({
        userRepository: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      await handler.execute(validCommand);

      expect(userRepository.deleteById).not.toHaveBeenCalled();
    });
  });
});
