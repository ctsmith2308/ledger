import { describe, it, expect, vi } from 'vitest';

import { DisableMfaHandler } from '../disable-mfa.handler';
import { DisableMfaCommand } from '../disable-mfa.command';

import {
  type IUserRepository,
  User,
  UserId,
  Email,
  Password,
  UserTier,
} from '@/core/modules/identity/domain';

import {
  type IEventBus,
  UserNotFoundException,
} from '@/core/shared/domain';

const _makeUser = (opts?: { mfaEnabled?: boolean }) =>
  User.reconstitute(
    UserId.from('user-12345'),
    Email.from('user@example.com'),
    Password.fromHash('stored-hash'),
    UserTier.from('TRIAL'),
    opts?.mfaEnabled ?? false,
    opts?.mfaEnabled ? 'TOTP_SECRET' : undefined,
  );

const _makeHandler = (overrides: {
  userRepository?: Partial<IUserRepository>;
  eventBus?: Partial<IEventBus>;
} = {}) => {
  const userRepository: IUserRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(_makeUser({ mfaEnabled: true })),
    findByEmail: vi.fn(),
    deleteById: vi.fn(),
    findExpiredTrialUsers: vi.fn().mockResolvedValue([]),
    ...overrides.userRepository,
  };

  const eventBus: IEventBus = {
    dispatch: vi.fn(),
    register: vi.fn(),
    ...overrides.eventBus,
  };

  const handler = new DisableMfaHandler(userRepository, eventBus);

  return { handler, userRepository, eventBus };
};

describe('DisableMfaHandler', () => {
  const validCommand = new DisableMfaCommand('user-12345');

  describe('success path', () => {
    it('saves the user after disabling MFA', async () => {
      const { handler, userRepository } = _makeHandler();

      await handler.execute(validCommand);

      expect(userRepository.save).toHaveBeenCalledTimes(1);
    });

    it('dispatches domain events', async () => {
      const { handler, eventBus } = _makeHandler();

      await handler.execute(validCommand);

      expect(eventBus.dispatch).toHaveBeenCalledTimes(1);
    });

    it('returns the user on success', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeInstanceOf(User);
    });
  });

  describe('failure paths', () => {
    it('fails when user is not found', async () => {
      const { handler } = _makeHandler({
        userRepository: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(UserNotFoundException);
    });

    it('does not save when user is not found', async () => {
      const { handler, userRepository } = _makeHandler({
        userRepository: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      await handler.execute(validCommand);

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('does not dispatch events when user is not found', async () => {
      const { handler, eventBus } = _makeHandler({
        userRepository: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      await handler.execute(validCommand);

      expect(eventBus.dispatch).not.toHaveBeenCalled();
    });
  });
});
