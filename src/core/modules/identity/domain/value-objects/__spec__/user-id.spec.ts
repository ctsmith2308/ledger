import { describe, it, expect } from 'vitest';
import { UserId } from '../user/user-id.value-object';
import { InvalidUserIdException } from '@/core/shared/domain';

describe('UserId', () => {
  describe('create', () => {
    it('succeeds with a valid id of 5+ characters', () => {
      const result = UserId.create('abc123');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('abc123');
    });

    it('succeeds with exactly 5 characters', () => {
      const result = UserId.create('12345');

      expect(result.isSuccess).toBe(true);
    });

    it('fails with fewer than 5 characters', () => {
      const result = UserId.create('abcd');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidUserIdException);
    });

    it('fails with empty string', () => {
      const result = UserId.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidUserIdException);
    });

    it('fails with falsy value', () => {
      const result = UserId.create(null as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidUserIdException);
    });
  });

  describe('from', () => {
    it('creates a UserId without validation', () => {
      const userId = UserId.from('any-string');

      expect(userId.value).toBe('any-string');
    });
  });

  describe('equals', () => {
    it('returns true for equal ids', () => {
      const a = UserId.create('same-user-id').value;
      const b = UserId.create('same-user-id').value;

      expect(a.equals(b)).toBe(true);
    });

    it('returns false for different ids', () => {
      const a = UserId.create('user-id-1').value;
      const b = UserId.create('user-id-2').value;

      expect(a.equals(b)).toBe(false);
    });
  });
});
