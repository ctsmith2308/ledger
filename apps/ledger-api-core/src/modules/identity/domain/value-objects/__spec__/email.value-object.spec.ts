import { Email } from '@/modules/identity/domain';
import { InvalidEmailException } from '@/modules/identity/domain';

describe('Email', () => {
  describe('create()', () => {
    it('should create a valid email', () => {
      const email = Email.create('User@Example.COM');
      expect(email.value).toBe('user@example.com');
    });

    it('should lowercase and trim the email', () => {
      const email = Email.create('  Hello@World.com  ');
      expect(email.value).toBe('hello@world.com');
    });

    it('should throw InvalidEmailException for missing @', () => {
      expect(() => Email.create('notanemail.com')).toThrow(
        InvalidEmailException,
      );
    });

    it('should throw InvalidEmailException for missing domain', () => {
      expect(() => Email.create('user@')).toThrow(InvalidEmailException);
    });

    it('should throw InvalidEmailException for empty string', () => {
      expect(() => Email.create('')).toThrow(InvalidEmailException);
    });

    it('should throw InvalidEmailException for email with spaces', () => {
      expect(() => Email.create('user @example.com')).toThrow(
        InvalidEmailException,
      );
    });
  });

  describe('fromValue()', () => {
    it('should create an Email bypassing validation', () => {
      const email = Email.fromValue('already-trusted@example.com');
      expect(email.value).toBe('already-trusted@example.com');
    });

    it('should not throw even for a value that would fail create()', () => {
      expect(() => Email.fromValue('not-an-email')).not.toThrow();
    });
  });

  describe('equals()', () => {
    it('should return true for two emails with the same value', () => {
      const a = Email.create('user@example.com');
      const b = Email.create('user@example.com');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different emails', () => {
      const a = Email.create('a@example.com');
      const b = Email.create('b@example.com');
      expect(a.equals(b)).toBe(false);
    });

    it('should return false when compared to undefined', () => {
      const a = Email.create('user@example.com');
      expect(a.equals(undefined)).toBe(false);
    });
  });
});
