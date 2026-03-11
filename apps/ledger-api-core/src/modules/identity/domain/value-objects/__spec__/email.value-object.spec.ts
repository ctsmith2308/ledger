import { Email } from '@/modules/identity/domain';
import { InvalidEmailException } from '@/modules/identity/domain';

describe('Email', () => {
  describe('create()', () => {
    it('should create a valid email', () => {
      const result = Email.create('User@Example.COM');
      expect(result.isSuccess).toBe(true);
      expect(result.value.address).toBe('user@example.com');
    });

    it('should lowercase and trim the email', () => {
      const result = Email.create('  Hello@World.com  ');
      expect(result.isSuccess).toBe(true);
      expect(result.value.address).toBe('hello@world.com');
    });

    it('should return a failure for missing @', () => {
      const result = Email.create('notanemail.com');
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidEmailException);
    });

    it('should return a failure for missing domain', () => {
      const result = Email.create('user@');
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidEmailException);
    });

    it('should return a failure for empty string', () => {
      const result = Email.create('');
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidEmailException);
    });

    it('should return a failure for email with spaces', () => {
      const result = Email.create('user @example.com');
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidEmailException);
    });
  });

  describe('fromValue()', () => {
    it('should create an Email bypassing validation', () => {
      const email = Email.from('already-trusted@example.com');
      expect(email.address).toBe('already-trusted@example.com');
    });

    it('should not throw even for a value that would fail create()', () => {
      expect(() => Email.from('not-an-email')).not.toThrow();
    });
  });

  describe('equals()', () => {
    it('should return true for two emails with the same value', () => {
      const a = Email.create('user@example.com').value;
      const b = Email.create('user@example.com').value;
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different emails', () => {
      const a = Email.create('a@example.com').value;
      const b = Email.create('b@example.com').value;
      expect(a.equals(b)).toBe(false);
    });

    it('should return false when compared to undefined', () => {
      const a = Email.create('user@example.com').value;
      expect(a.equals(undefined)).toBe(false);
    });
  });
});
