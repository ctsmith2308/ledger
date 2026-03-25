import { describe, it, expect } from 'vitest';
import { SessionId } from '../user/session-id.value-object';
import { InvalidSessionIdException } from '@/core/shared/domain';

describe('SessionId', () => {
  describe('create', () => {
    it('succeeds with a non-empty string', () => {
      const result = SessionId.create('session-token-123');

      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe('session-token-123');
    });

    it('fails with empty string', () => {
      const result = SessionId.create('');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidSessionIdException);
    });

    it('fails with whitespace-only string', () => {
      const result = SessionId.create('   ');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidSessionIdException);
    });

    it('fails with falsy value', () => {
      const result = SessionId.create(null as unknown as string);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(InvalidSessionIdException);
    });
  });

  describe('from', () => {
    it('creates a SessionId without validation', () => {
      const sessionId = SessionId.from('raw-id');

      expect(sessionId.value).toBe('raw-id');
    });
  });
});
