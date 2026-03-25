import { describe, it, expect } from 'vitest';
import { User } from '../user.aggregate';
import { UserId, Email, Password } from '../../value-objects';
import { UserRegisteredEvent } from '../../events';

const _makeUser = () => {
  const id = UserId.from('user-12345');
  const email = Email.from('test@example.com');
  const passwordHash = Password.fromHash('hashed-pw');
  return { id, email, passwordHash };
};

describe('User', () => {
  describe('register', () => {
    it('creates a user with the given values', () => {
      const { id, email, passwordHash } = _makeUser();

      const user = User.register(id, email, passwordHash);

      expect(user.id).toBe(id);
      expect(user.email).toBe(email);
      expect(user.passwordHash).toBe(passwordHash);
      expect(user.mfaEnabled).toBe(false);
      expect(user.mfaSecret).toBeUndefined();
    });

    it('adds a UserRegisteredEvent', () => {
      const { id, email, passwordHash } = _makeUser();

      const user = User.register(id, email, passwordHash);
      const events = user.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserRegisteredEvent);

      const event = events[0] as UserRegisteredEvent;
      expect(event.aggregateId).toBe('user-12345');
      expect(event.email).toBe('test@example.com');
    });
  });

  describe('enableMfa', () => {
    it('sets mfaEnabled and mfaSecret', () => {
      const { id, email, passwordHash } = _makeUser();
      const user = User.register(id, email, passwordHash);

      user.enableMfa('TOTP_SECRET');

      expect(user.mfaEnabled).toBe(true);
      expect(user.mfaSecret).toBe('TOTP_SECRET');
    });
  });

  describe('reconstitute', () => {
    it('rebuilds a user without emitting events', () => {
      const { id, email, passwordHash } = _makeUser();

      const user = User.reconstitute(id, email, passwordHash, true, 'secret');

      expect(user.mfaEnabled).toBe(true);
      expect(user.mfaSecret).toBe('secret');
      expect(user.pullDomainEvents()).toHaveLength(0);
    });
  });

  describe('pullDomainEvents', () => {
    it('clears events after pulling', () => {
      const { id, email, passwordHash } = _makeUser();
      const user = User.register(id, email, passwordHash);

      user.pullDomainEvents();
      const secondPull = user.pullDomainEvents();

      expect(secondPull).toHaveLength(0);
    });
  });
});
