import { describe, it, expect } from 'vitest';
import { Result } from '../result';

describe('Result', () => {
  describe('ok', () => {
    it('creates a success result with the given value', () => {
      const result = Result.ok('hello');

      expect(result.isSuccess).toBe(true);
      expect(result.isFailure).toBe(false);
      expect(result.status).toBe('SUCCESS');
      expect(result.value).toBe('hello');
    });

    it('supports complex value types', () => {
      const data = { id: 1, name: 'test' };
      const result = Result.ok(data);

      expect(result.value).toEqual(data);
    });
  });

  describe('fail', () => {
    it('creates a failure result with the given error', () => {
      const error = new Error('something went wrong');
      const result = Result.fail(error);

      expect(result.isFailure).toBe(true);
      expect(result.isSuccess).toBe(false);
      expect(result.status).toBe('FAIL');
      expect(result.error).toBe(error);
    });
  });

  describe('value', () => {
    it('throws when accessing value on a failure result', () => {
      const result = Result.fail(new Error('fail'));

      expect(() => result.value).toThrow(
        "Can't get the value of a failure result.",
      );
    });
  });

  describe('error', () => {
    it('throws when accessing error on a success result', () => {
      const result = Result.ok('value');

      expect(() => result.error).toThrow(
        "Can't get the error of a success result.",
      );
    });
  });

  describe('getValueOrThrow', () => {
    it('returns the value for a success result', () => {
      const result = Result.ok(42);

      expect(result.getValueOrThrow()).toBe(42);
    });

    it('throws the underlying error for a failure result', () => {
      const error = new Error('domain failure');
      const result = Result.fail(error);

      expect(() => result.getValueOrThrow()).toThrow(error);
    });
  });

  describe('immutability', () => {
    it('is frozen after creation', () => {
      const result = Result.ok('frozen');

      expect(Object.isFrozen(result)).toBe(true);
    });
  });
});
