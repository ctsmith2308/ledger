import { describe, it, expect, vi } from 'vitest';
import { RegisterUserHandler } from '../register-user.handler';
import { RegisterUserCommand } from '../register-user.command';
import {
  type IUserRepository,
  type IUserProfileRepository,
  type IPasswordHasher,
  type IIdGenerator,
  Email,
  User,
  UserId,
  Password,
} from '@/core/modules/identity/domain';
import { type IEventBus } from '@/core/shared/domain';

const _makeHandler = (overrides: {
  userRepository?: Partial<IUserRepository>;
  userProfileRepository?: Partial<IUserProfileRepository>;
  eventBus?: Partial<IEventBus>;
  hasher?: Partial<IPasswordHasher>;
  idGenerator?: Partial<IIdGenerator>;
} = {}) => {
  const userRepository: IUserRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn().mockResolvedValue(null),
    deleteById: vi.fn(),
    ...overrides.userRepository,
  };

  const userProfileRepository: IUserProfileRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    ...overrides.userProfileRepository,
  };

  const eventBus: IEventBus = {
    dispatch: vi.fn(),
    register: vi.fn(),
    ...overrides.eventBus,
  };

  const hasher: IPasswordHasher = {
    hash: vi.fn().mockResolvedValue('hashed-password'),
    verify: vi.fn(),
    ...overrides.hasher,
  };

  const idGenerator: IIdGenerator = {
    generate: vi.fn().mockReturnValue('generated-user-id'),
    ...overrides.idGenerator,
  };

  const handler = new RegisterUserHandler(
    userRepository,
    userProfileRepository,
    eventBus,
    hasher,
    idGenerator,
  );

  return { handler, userRepository, userProfileRepository, eventBus, hasher, idGenerator };
};

describe('RegisterUserHandler', () => {
  const validCommand = new RegisterUserCommand(
    'Test',
    'User',
    'test@example.com',
    'Secure!1',
  );

  describe('success path', () => {
    it('registers a new user and returns SUCCESS', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      expect(result.value.type).toBe('SUCCESS');
    });

    it('persists the user via repository', async () => {
      const { handler, userRepository } = _makeHandler();

      await handler.execute(validCommand);

      expect(userRepository.save).toHaveBeenCalledTimes(1);
      const savedUser = (userRepository.save as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as User;
      expect(savedUser.email.value).toBe('test@example.com');
    });

    it('hashes the password before persisting', async () => {
      const { handler, hasher } = _makeHandler();

      await handler.execute(validCommand);

      expect(hasher.hash).toHaveBeenCalledWith('Secure!1');
    });

    it('creates a user profile with first and last name', async () => {
      const { handler, userProfileRepository } = _makeHandler();

      await handler.execute(validCommand);

      expect(userProfileRepository.save).toHaveBeenCalledTimes(1);
      const savedProfile = (
        userProfileRepository.save as ReturnType<typeof vi.fn>
      ).mock.calls[0][0];
      expect(savedProfile.firstName.value).toBe('Test');
      expect(savedProfile.lastName.value).toBe('User');
    });

    it('dispatches domain events', async () => {
      const { handler, eventBus } = _makeHandler();

      await handler.execute(validCommand);

      expect(eventBus.dispatch).toHaveBeenCalledTimes(1);
    });
  });

  describe('duplicate email', () => {
    it('returns PENDING_VERIFICATION when user already exists', async () => {
      const existingUser = User.reconstitute(
        UserId.from('existing-id'),
        Email.from('test@example.com'),
        Password.fromHash('hash'),
        false,
      );

      const { handler } = _makeHandler({
        userRepository: {
          findByEmail: vi.fn().mockResolvedValue(existingUser),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      expect(result.value.type).toBe('PENDING_VERIFICATION');
    });

    it('does not persist a new user when duplicate exists', async () => {
      const existingUser = User.reconstitute(
        UserId.from('existing-id'),
        Email.from('test@example.com'),
        Password.fromHash('hash'),
        false,
      );

      const { handler, userRepository } = _makeHandler({
        userRepository: {
          findByEmail: vi.fn().mockResolvedValue(existingUser),
        },
      });

      await handler.execute(validCommand);

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('does not create a profile when duplicate exists', async () => {
      const existingUser = User.reconstitute(
        UserId.from('existing-id'),
        Email.from('test@example.com'),
        Password.fromHash('hash'),
        false,
      );

      const { handler, userProfileRepository } = _makeHandler({
        userRepository: {
          findByEmail: vi.fn().mockResolvedValue(existingUser),
        },
      });

      await handler.execute(validCommand);

      expect(userProfileRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('validation failures', () => {
    it('fails with invalid email', async () => {
      const { handler } = _makeHandler();
      const command = new RegisterUserCommand('Test', 'User', 'bad-email', 'Secure!1');

      const result = await handler.execute(command);

      expect(result.isFailure).toBe(true);
    });

    it('fails with invalid password (no special char)', async () => {
      const { handler } = _makeHandler();
      const command = new RegisterUserCommand(
        'Test',
        'User',
        'test@example.com',
        'NoSpecial1',
      );

      const result = await handler.execute(command);

      expect(result.isFailure).toBe(true);
    });

    it('fails with invalid password (no number)', async () => {
      const { handler } = _makeHandler();
      const command = new RegisterUserCommand(
        'Test',
        'User',
        'test@example.com',
        'NoNumber!',
      );

      const result = await handler.execute(command);

      expect(result.isFailure).toBe(true);
    });

    it('fails with empty first name', async () => {
      const { handler } = _makeHandler();
      const command = new RegisterUserCommand(
        '',
        'User',
        'test@example.com',
        'Secure!1',
      );

      const result = await handler.execute(command);

      expect(result.isFailure).toBe(true);
    });

    it('fails with empty last name', async () => {
      const { handler } = _makeHandler();
      const command = new RegisterUserCommand(
        'Test',
        '',
        'test@example.com',
        'Secure!1',
      );

      const result = await handler.execute(command);

      expect(result.isFailure).toBe(true);
    });

    it('does not call repository when first name is invalid', async () => {
      const { handler, userRepository } = _makeHandler();
      const command = new RegisterUserCommand(
        '',
        'User',
        'test@example.com',
        'Secure!1',
      );

      await handler.execute(command);

      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });

    it('does not call repository when email is invalid', async () => {
      const { handler, userRepository } = _makeHandler();
      const command = new RegisterUserCommand('Test', 'User', 'bad', 'Secure!1');

      await handler.execute(command);

      expect(userRepository.findByEmail).not.toHaveBeenCalled();
    });
  });
});
