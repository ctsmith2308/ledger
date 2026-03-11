import { User } from '../user.aggregate';
import { Email, Password, UserId } from '@/modules/identity/domain';
import { IdentityEvents } from '@/shared/domain';

const makeUser = () => {
  const id = UserId.from('test-uuid-12345');
  const email = Email.from('user@example.com');
  const password = Password.fromHash('hashed-password');

  return { id, email, password };
};

describe('User aggregate', () => {
  describe('register()', () => {
    it('should create a User with correct properties', () => {
      const { id, email, password } = makeUser();
      const user = User.register(id, email, password);

      expect(user.id.value).toBe('test-uuid-12345');
      expect(user.email.address).toBe('user@example.com');
      expect(user.passwordHash.content).toBe('hashed-password');
      expect(user.mfaEnabled).toBe(false);
      expect(user.mfaSecret).toBeUndefined();
    });

    it('should emit a UserRegisteredEvent', () => {
      const { id, email, password } = makeUser();
      const user = User.register(id, email, password);

      const events = user.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe(IdentityEvents.USER_REGISTERED);
      expect(events[0].aggregateId).toBe('test-uuid-12345');
    });

    it('should clear events after pullDomainEvents()', () => {
      const { id, email, password } = makeUser();
      const user = User.register(id, email, password);

      user.pullDomainEvents();
      const secondPull = user.pullDomainEvents();

      expect(secondPull).toHaveLength(0);
    });
  });

  describe('reconstitute()', () => {
    it('should rebuild a User without emitting any events', () => {
      const { id, email, password } = makeUser();
      const user = User.reconstitute(id, email, password, false);

      expect(user.pullDomainEvents()).toHaveLength(0);
    });

    it('should restore mfaEnabled and mfaSecret', () => {
      const { id, email, password } = makeUser();
      const user = User.reconstitute(
        id,
        email,
        password,
        true,
        'mfa-secret-abc',
      );

      expect(user.mfaEnabled).toBe(true);
      expect(user.mfaSecret).toBe('mfa-secret-abc');
    });
  });

  describe('enableMfa()', () => {
    it('should set mfaEnabled to true and store the secret', () => {
      const { id, email, password } = makeUser();
      const user = User.register(id, email, password);

      user.enableMfa('totp-secret-xyz');

      expect(user.mfaEnabled).toBe(true);
      expect(user.mfaSecret).toBe('totp-secret-xyz');
    });
  });
});
