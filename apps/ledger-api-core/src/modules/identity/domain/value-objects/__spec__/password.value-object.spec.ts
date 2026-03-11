import { Password } from '@/modules/identity/domain';
import { InvalidPasswordException } from '@/modules/identity/domain/exceptions';

describe('Password', () => {
  describe('create()', () => {
    it('should create a valid password with a special char and number', () => {
      const result = Password.create('Secure@Pass1');
      expect(result.isSuccess).toBe(true);
      expect(result.value.content).toBe('Secure@Pass1');
    });

    it('should return a failure when missing a special character', () => {
      const result = Password.create('SecurePass1');
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidPasswordException);
    });

    it('should return a failure when missing a number', () => {
      const result = Password.create('Secure@Pass');
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidPasswordException);
    });

    it('should return a failure for an empty string', () => {
      const result = Password.create('');
      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidPasswordException);
    });

    it('should accept all supported special characters', () => {
      const specials = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
      specials.forEach((char) => {
        const result = Password.create(`ValidPass1${char}`);
        expect(result.isSuccess).toBe(true);
      });
    });
  });

  describe('fromHash()', () => {
    it('should create a Password from an existing hash without validation', () => {
      const hash = '$argon2id$v=19$...somehashvalue';
      const password = Password.fromHash(hash);
      expect(password.content).toBe(hash);
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
