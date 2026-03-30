import { describe, it, expect, vi } from 'vitest';
import { QueryBus } from '../query-bus';
import { Query, Result, DomainException, type IObservabilityService } from '@/core/shared/domain';

class TestException extends DomainException {
  constructor() {
    super('Test failed', 'TEST_ERROR');
  }
}

type TestResponse = Result<string, DomainException>;

class TestQuery extends Query<TestResponse> {
  constructor(readonly id: string) {
    super();
  }
}

const _mockObservability = (): IObservabilityService => ({
  recordHandlerFailure: vi.fn(),
});

describe('QueryBus', () => {
  describe('dispatch', () => {
    it('returns the handler result on success', async () => {
      const bus = new QueryBus(_mockObservability());

      bus.register(TestQuery, {
        execute: vi.fn().mockResolvedValue(Result.ok('data')),
      });

      const result = await bus.dispatch(new TestQuery('123'));

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('data');
    });

    it('returns the handler result on failure', async () => {
      const bus = new QueryBus(_mockObservability());

      bus.register(TestQuery, {
        execute: vi.fn().mockResolvedValue(
          Result.fail(new TestException()),
        ),
      });

      const result = await bus.dispatch(new TestQuery('123'));

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(TestException);
    });

    it('re-throws unexpected handler errors', async () => {
      const bus = new QueryBus(_mockObservability());

      bus.register(TestQuery, {
        execute: vi.fn().mockRejectedValue(new Error('unexpected')),
      });

      await expect(
        bus.dispatch(new TestQuery('123')),
      ).rejects.toThrow('unexpected');
    });

    it('records handler failure on unexpected error', async () => {
      const observability = _mockObservability();
      const bus = new QueryBus(observability);

      bus.register(TestQuery, {
        execute: vi.fn().mockRejectedValue(new Error('unexpected')),
      });

      await expect(
        bus.dispatch(new TestQuery('123')),
      ).rejects.toThrow();

      expect(observability.recordHandlerFailure).toHaveBeenCalledWith(
        'TestQuery',
        expect.any(Error),
      );
    });

    it('throws when no handler is registered', async () => {
      const bus = new QueryBus(_mockObservability());

      await expect(
        bus.dispatch(new TestQuery('123')),
      ).rejects.toThrow('No handler registered for query');
    });
  });
});
