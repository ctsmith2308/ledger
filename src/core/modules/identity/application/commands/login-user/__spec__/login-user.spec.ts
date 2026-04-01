import { describe, it, expect, vi } from 'vitest';

import { LoginUserHandler } from '../login-user.handler';
import { LoginUserCommand } from '../login-user.command';

import {
  type IUserRepository,
  type IPasswordHasher,
  Email,
  User,
  UserId,
  Password,
  UserTier,
} from '@/core/modules/identity/domain';

import {
  type IEventBus,
  InvalidEmailException,
  InvalidPasswordException,
} from '@/core/shared/domain';

const _existingUser = (opts?: { tier?: string; mfaEnabled?: boolean }) =>
  User.reconstitute(
    UserId.from('user-12345'),
    Email.from('user@example.com'),
    Password.fromHash('stored-hash'),
    UserTier.from(opts?.tier ?? 'TRIAL'),
    opts?.mfaEnabled ?? false,
    opts?.mfaEnabled ? 'totp-secret' : undefined,
  );

const _makeHandler = (overrides: {
  userRepository?: Partial<IUserRepository>;
  eventBus?: Partial<IEventBus>;
  hasher?: Partial<IPasswordHasher>;
} = {}) => {
  const userRepository: IUserRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(_existingUser()),
    deleteById: vi.fn(),
    findExpiredTrialUsers: vi.fn().mockResolvedValue([]),
    ...overrides.userRepository,
  };

  const eventBus: IEventBus = {
    dispatch: vi.fn(),
    register: vi.fn(),
    ...overrides.eventBus,
  };

  const hasher: IPasswordHasher = {
    hash: vi.fn(),
    verify: vi.fn().mockResolvedValue(true),
    ...overrides.hasher,
  };

  const handler = new LoginUserHandler(userRepository, eventBus, hasher);

  return { handler, userRepository, eventBus, hasher };
};

describe('LoginUserHandler', () => {
  const validCommand = new LoginUserCommand(
    'user@example.com',
    'Secure!1',
  );

  describe('success path (no MFA)', () => {
    it('returns SUCCESS with the user', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      expect(result.value.type).toBe('SUCCESS');
    });

    it('verifies the password against the stored hash', async () => {
      const { handler, hasher } = _makeHandler();

      await handler.execute(validCommand);

      expect(hasher.verify).toHaveBeenCalledWith('stored-hash', 'Secure!1');
    });

    it('dispatches a UserLoggedInEvent', async () => {
      const { handler, eventBus } = _makeHandler();

      await handler.execute(validCommand);

      expect(eventBus.dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('MFA path', () => {
    it('returns MFA_REQUIRED when MFA is enabled', async () => {
      const { handler } = _makeHandler({
        userRepository: {
          findByEmail: vi
            .fn()
            .mockResolvedValue(_existingUser({ mfaEnabled: true })),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      expect(result.value.type).toBe('MFA_REQUIRED');
    });

    it('does not dispatch events on MFA path', async () => {
      const { handler, eventBus } = _makeHandler({
        userRepository: {
          findByEmail: vi
            .fn()
            .mockResolvedValue(_existingUser({ mfaEnabled: true })),
        },
      });

      await handler.execute(validCommand);

      expect(eventBus.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('failure paths', () => {
    it('fails with invalid email format', async () => {
      const { handler } = _makeHandler();
      const command = new LoginUserCommand('bad-email', 'Secure!1');

      const result = await handler.execute(command);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidEmailException);
    });

    it('fails with invalid password format', async () => {
      const { handler } = _makeHandler();
      const command = new LoginUserCommand(
        'user@example.com',
        'nospecialchar1',
      );

      const result = await handler.execute(command);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidPasswordException);
    });

    it('fails when user is not found', async () => {
      const { handler } = _makeHandler({
        userRepository: {
          findByEmail: vi.fn().mockResolvedValue(null),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidEmailException);
    });

    it('fails when password does not match', async () => {
      const { handler } = _makeHandler({
        hasher: { verify: vi.fn().mockResolvedValue(false) },
      });

      const result = await handler.execute(validCommand);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidPasswordException);
    });

    it('dispatches LoginFailedEvent on user not found', async () => {
      const { handler, eventBus } = _makeHandler({
        userRepository: {
          findByEmail: vi.fn().mockResolvedValue(null),
        },
      });

      await handler.execute(validCommand);

      expect(eventBus.dispatch).toHaveBeenCalledTimes(1);
    });

    it('dispatches LoginFailedEvent on password mismatch', async () => {
      const { handler, eventBus } = _makeHandler({
        hasher: { verify: vi.fn().mockResolvedValue(false) },
      });

      await handler.execute(validCommand);

      expect(eventBus.dispatch).toHaveBeenCalledTimes(1);
    });
  });
});
