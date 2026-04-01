import { describe, it, expect } from 'vitest';

import { User } from '../user.aggregate';

import {
  UserId,
  Email,
  Password,
  UserTier,
  USER_TIERS,
} from '../../value-objects';

import {
  UserRegisteredEvent,
  MfaEnabledEvent,
  MfaDisabledEvent,
} from '../../events';

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
      expect(user.tier.value).toBe(USER_TIERS.TRIAL);
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

  describe('setMfaSecret', () => {
    it('stores the secret without enabling MFA', () => {
      const { id, email, passwordHash } = _makeUser();
      const user = User.register(id, email, passwordHash);
      user.pullDomainEvents();

      user.setMfaSecret('TOTP_SECRET');

      expect(user.mfaSecret).toBe('TOTP_SECRET');
      expect(user.mfaEnabled).toBe(false);
      expect(user.pullDomainEvents()).toHaveLength(0);
    });
  });

  describe('confirmMfa', () => {
    it('enables MFA and raises MfaEnabledEvent when secret is set', () => {
      const { id, email, passwordHash } = _makeUser();
      const user = User.register(id, email, passwordHash);
      user.pullDomainEvents();
      user.setMfaSecret('TOTP_SECRET');

      user.confirmMfa();

      expect(user.mfaEnabled).toBe(true);
      const events = user.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(MfaEnabledEvent);
      expect(events[0].aggregateId).toBe('user-12345');
    });

    it('does nothing when no secret is set', () => {
      const { id, email, passwordHash } = _makeUser();
      const user = User.register(id, email, passwordHash);
      user.pullDomainEvents();

      user.confirmMfa();

      expect(user.mfaEnabled).toBe(false);
      expect(user.pullDomainEvents()).toHaveLength(0);
    });
  });

  describe('disableMfa', () => {
    it('disables MFA, clears secret, and raises MfaDisabledEvent', () => {
      const { id, email, passwordHash } = _makeUser();
      const user = User.reconstitute(
        id,
        email,
        passwordHash,
        UserTier.from('TRIAL'),
        true,
        'TOTP_SECRET',
      );

      user.disableMfa();

      expect(user.mfaEnabled).toBe(false);
      expect(user.mfaSecret).toBeUndefined();
      const events = user.pullDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(MfaDisabledEvent);
      expect(events[0].aggregateId).toBe('user-12345');
    });

    it('does nothing when MFA is already disabled', () => {
      const { id, email, passwordHash } = _makeUser();
      const user = User.register(id, email, passwordHash);
      user.pullDomainEvents();

      user.disableMfa();

      expect(user.mfaEnabled).toBe(false);
      expect(user.pullDomainEvents()).toHaveLength(0);
    });
  });

  describe('reconstitute', () => {
    it('rebuilds a user without emitting events', () => {
      const { id, email, passwordHash } = _makeUser();

      const user = User.reconstitute(
        id,
        email,
        passwordHash,
        UserTier.from('FULL'),
        true,
        'secret',
      );

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
