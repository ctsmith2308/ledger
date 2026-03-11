import { EventBus, IEvent } from '@nestjs/cqrs';
import type { Mock } from 'vitest';

import {
  RegisterUserCommand,
  RegisterUserHandler,
} from '@/modules/identity/application';

import {
  Email,
  IIdGenerator,
  IPasswordHasher,
  IUserRepository,
  User,
  InvalidEmailException,
  WeakPasswordException,
} from '@/modules/identity/domain';

import { IdentityEvents } from '@/shared/domain';

// --- In-memory fakes ---

class InMemoryUserRepository implements IUserRepository {
  private store: User[] = [];

  save(user: User): Promise<void> {
    this.store.push(user);
    return Promise.resolve();
  }

  findByEmail(email: Email): Promise<User | null> {
    const found = this.store.find((u) => u.email.value === email.value) ?? null;
    return Promise.resolve(found);
  }
}

const fakeHasher: IPasswordHasher = {
  hash: (pw: string) => {
    const hashed = `hashed:${pw}`;

    return Promise.resolve(hashed);
  },
};

const fakeIdGenerator: IIdGenerator = {
  generate: () => 'test-uuid-12345',
};

// --- Tests ---

describe('RegisterUserHandler', () => {
  let handler: RegisterUserHandler;
  let repo: InMemoryUserRepository;
  let eventBus: { publish: Mock };

  beforeEach(() => {
    repo = new InMemoryUserRepository();
    eventBus = { publish: vi.fn() };
    handler = new RegisterUserHandler(
      repo,
      fakeHasher,
      fakeIdGenerator,
      eventBus as unknown as EventBus<IEvent>,
    );
  });

  it('should persist a new user and return its id', async () => {
    const result = await handler.execute(
      new RegisterUserCommand('user@example.com', 'Secure@Pass1'),
    );

    expect(result).toEqual({ id: 'test-uuid-12345' });

    const saved = await repo.findByEmail(Email.create('user@example.com'));
    expect(saved).not.toBeNull();
    expect(saved!.id.value).toBe('test-uuid-12345');
  });

  it('should store the hashed password, not the plaintext', async () => {
    await handler.execute(
      new RegisterUserCommand('user@example.com', 'Secure@Pass1'),
    );

    const saved = await repo.findByEmail(Email.create('user@example.com'));
    expect(saved!.passwordHash.value).toBe('hashed:Secure@Pass1');
    expect(saved!.passwordHash.value).not.toBe('Secure@Pass1');
  });

  it('should publish a UserRegisteredEvent after saving', async () => {
    await handler.execute(
      new RegisterUserCommand('user@example.com', 'Secure@Pass1'),
    );

    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: IdentityEvents.USER_REGISTERED,
        aggregateId: 'test-uuid-12345',
      }),
    );
  });

  it('should throw if the email is already registered', async () => {
    await handler.execute(
      new RegisterUserCommand('user@example.com', 'Secure@Pass1'),
    );

    await expect(
      handler.execute(
        new RegisterUserCommand('user@example.com', 'Another@Pass1'),
      ),
    ).rejects.toThrow('Email already registered');
  });

  it('should throw InvalidEmailException for a malformed email', async () => {
    await expect(
      handler.execute(new RegisterUserCommand('not-an-email', 'Secure@Pass1')),
    ).rejects.toThrow(InvalidEmailException);
  });

  it('should throw WeakPasswordException for a password without a special character', async () => {
    await expect(
      handler.execute(
        new RegisterUserCommand('user@example.com', 'SecurePass1'),
      ),
    ).rejects.toThrow(WeakPasswordException);
  });

  it('should throw WeakPasswordException for a password without a number', async () => {
    await expect(
      handler.execute(
        new RegisterUserCommand('user@example.com', 'Secure@Pass'),
      ),
    ).rejects.toThrow(WeakPasswordException);
  });

  it('should not publish any events if saving fails', async () => {
    vi.spyOn(repo, 'save').mockRejectedValueOnce(new Error('DB error'));

    await expect(
      handler.execute(
        new RegisterUserCommand('user@example.com', 'Secure@Pass1'),
      ),
    ).rejects.toThrow('DB error');

    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
