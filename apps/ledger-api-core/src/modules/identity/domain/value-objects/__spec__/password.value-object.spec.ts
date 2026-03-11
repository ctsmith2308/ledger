import { Password } from '@/modules/identity/domain';
import { WeakPasswordException } from '@/modules/identity/domain/exceptions';

describe('Password', () => {
  describe('create()', () => {
    it('should create a valid password with a special char and number', () => {
      const password = Password.create('Secure@Pass1');
      expect(password.value).toBe('Secure@Pass1');
    });

    it('should throw WeakPasswordException when missing a special character', () => {
      expect(() => Password.create('SecurePass1')).toThrow(
        WeakPasswordException,
      );
      expect(() => Password.create('SecurePass1')).toThrow(
        'Password must contain a special character',
      );
    });

    it('should throw WeakPasswordException when missing a number', () => {
      expect(() => Password.create('Secure@Pass')).toThrow(
        WeakPasswordException,
      );
      expect(() => Password.create('Secure@Pass')).toThrow(
        'Password must contain at least one number',
      );
    });

    it('should throw when password is empty', () => {
      expect(() => Password.create('')).toThrow(WeakPasswordException);
    });

    it('should accept all supported special characters', () => {
      const specials = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
      specials.forEach((char) => {
        expect(() => Password.create(`ValidPass1${char}`)).not.toThrow();
      });
    });
  });

  describe('fromHash()', () => {
    it('should create a Password from an existing hash without validation', () => {
      const hash = '$argon2id$v=19$...somehashvalue';
      const password = Password.fromHash(hash);
      expect(password.value).toBe(hash);
    });

    it('should not throw even if the value would fail create() rules', () => {
      expect(() => Password.fromHash('no-special-or-number')).not.toThrow();
    });
  });

  describe('equals()', () => {
    it('should return true for two passwords with the same value', () => {
      const a = Password.fromHash('same-hash');
      const b = Password.fromHash('same-hash');
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different password values', () => {
      const a = Password.fromHash('hash-a');
      const b = Password.fromHash('hash-b');
      expect(a.equals(b)).toBe(false);
    });
  });
});
