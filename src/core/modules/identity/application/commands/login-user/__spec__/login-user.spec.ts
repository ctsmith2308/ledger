import { describe, it, expect, vi } from 'vitest';
import { LoginUserHandler } from '../login-user.handler';
import { LoginUserCommand } from '../login-user.command';
import {
  type IUserRepository,
  type IUserSessionRepository,
  type IPasswordHasher,
  type IIdGenerator,
  Email,
  User,
  UserId,
  Password,
} from '@/core/modules/identity/domain';
import {
  type IEventBus,
  InvalidEmailException,
  InvalidPasswordException,
} from '@/core/shared/domain';

const _existingUser = () =>
  User.reconstitute(
    UserId.from('user-12345'),
    Email.from('user@example.com'),
    Password.fromHash('stored-hash'),
    false,
  );

const _makeHandler = (overrides: {
  userRepository?: Partial<IUserRepository>;
  sessionRepository?: Partial<IUserSessionRepository>;
  eventBus?: Partial<IEventBus>;
  hasher?: Partial<IPasswordHasher>;
  idGenerator?: Partial<IIdGenerator>;
} = {}) => {
  const userRepository: IUserRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(_existingUser()),
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

  const hasher: IPasswordHasher = {
    hash: vi.fn(),
    verify: vi.fn().mockResolvedValue(true),
    ...overrides.hasher,
  };

  const idGenerator: IIdGenerator = {
    generate: vi.fn().mockReturnValue('generated-session-id'),
    ...overrides.idGenerator,
  };

  const handler = new LoginUserHandler(
    userRepository,
    sessionRepository,
    eventBus,
    hasher,
    idGenerator,
  );

  return { handler, userRepository, sessionRepository, eventBus, hasher };
};

describe('LoginUserHandler', () => {
  const validCommand = new LoginUserCommand(
    'user@example.com',
    'Secure!1',
  );

  describe('success path', () => {
    it('returns a session on valid credentials', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      expect(result.value.id.value).toBe('generated-session-id');
      expect(result.value.userId.value).toBe('user-12345');
    });

    it('persists the session', async () => {
      const { handler, sessionRepository } = _makeHandler();

      await handler.execute(validCommand);

      expect(sessionRepository.save).toHaveBeenCalledTimes(1);
    });

    it('verifies the password against the stored hash', async () => {
      const { handler, hasher } = _makeHandler();

      await handler.execute(validCommand);

      expect(hasher.verify).toHaveBeenCalledWith('stored-hash', 'Secure!1');
    });

    it('dispatches a login event', async () => {
      const { handler, eventBus } = _makeHandler();

      await handler.execute(validCommand);

      expect(eventBus.dispatch).toHaveBeenCalledTimes(1);
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

    it('does not persist a session on password mismatch', async () => {
      const { handler, sessionRepository } = _makeHandler({
        hasher: { verify: vi.fn().mockResolvedValue(false) },
      });

      await handler.execute(validCommand);

      expect(sessionRepository.save).not.toHaveBeenCalled();
    });
  });
});
