import { describe, it, expect } from 'vitest';
import { FirstName } from '../user-profile/first-name.value-object';

describe('FirstName', () => {
  describe('create', () => {
    it('succeeds with a valid name', () => {
      const result = FirstName.create('Alice');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('Alice');
    });

    it('trims whitespace', () => {
      const result = FirstName.create('  Bob  ');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('Bob');
    });

    it('fails for empty string', () => {
      const result = FirstName.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('First name is required.');
    });

    it('fails for whitespace-only string', () => {
      const result = FirstName.create('   ');

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('First name is required.');
    });

    it('fails when exceeding 30 characters', () => {
      const result = FirstName.create('A'.repeat(31));

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe(
        'First name must be at most 30 characters.',
      );
    });

    it('succeeds with exactly 30 characters', () => {
      const result = FirstName.create('A'.repeat(30));

      expect(result.isSuccess).toBe(true);
    });

    it('handles null-like input', () => {
      const result = FirstName.create(null as unknown as string);

      expect(result.isFailure).toBe(true);
    });
  });

  describe('from', () => {
    it('creates a FirstName without validation', () => {
      const name = FirstName.from('stored-name');

      expect(name.value).toBe('stored-name');
    });
  });
});
