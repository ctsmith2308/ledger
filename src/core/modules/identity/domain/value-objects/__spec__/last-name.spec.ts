import { describe, it, expect } from 'vitest';
import { LastName } from '../user-profile/last-name.value-object';

describe('LastName', () => {
  describe('create', () => {
    it('succeeds with a valid name', () => {
      const result = LastName.create('Smith');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('Smith');
    });

    it('trims whitespace', () => {
      const result = LastName.create('  Jones  ');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('Jones');
    });

    it('fails for empty string', () => {
      const result = LastName.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Last name is required.');
    });

    it('fails for whitespace-only string', () => {
      const result = LastName.create('   ');

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe('Last name is required.');
    });

    it('fails when exceeding 30 characters', () => {
      const result = LastName.create('B'.repeat(31));

      expect(result.isFailure).toBe(true);
      expect(result.error.message).toBe(
        'Last name must be at most 30 characters.',
      );
    });

    it('succeeds with exactly 30 characters', () => {
      const result = LastName.create('B'.repeat(30));

      expect(result.isSuccess).toBe(true);
    });
  });

  describe('from', () => {
    it('creates a LastName without validation', () => {
      const name = LastName.from('stored-name');

      expect(name.value).toBe('stored-name');
    });
  });
});
