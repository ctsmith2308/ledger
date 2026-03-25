import { describe, it, expect } from 'vitest';
import { Password } from '../user/password.value-object';
import { InvalidPasswordException } from '@/core/shared/domain';

describe('Password', () => {
  describe('create', () => {
    it('succeeds with a valid password containing special char and number', () => {
      const result = Password.create('Secure!1');

      expect(result.isSuccess).toBe(true);
      expect(result.value.content).toBe('Secure!1');
    });

    it('fails when missing a special character', () => {
      const result = Password.create('NoSpecial1');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidPasswordException);
    });

    it('fails when missing a number', () => {
      const result = Password.create('NoNumber!');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidPasswordException);
    });

    it('fails when missing both special character and number', () => {
      const result = Password.create('JustLetters');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidPasswordException);
    });

    it('succeeds with various special characters', () => {
      const specials = ['!', '@', '#', '$', '%', '^', '&', '*'];

      for (const char of specials) {
        const result = Password.create(`Pass${char}1`);
        expect(result.isSuccess).toBe(true);
      }
    });
  });

  describe('fromHash', () => {
    it('creates a Password from a hash without validation', () => {
      const hash = '$argon2id$v=19$m=65536,t=3,p=4$somesalt$somehash';
      const password = Password.fromHash(hash);

      expect(password.content).toBe(hash);
    });
  });
});
