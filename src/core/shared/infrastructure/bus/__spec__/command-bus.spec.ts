import { describe, it, expect, vi } from 'vitest';

const mockSpanEnd = vi.fn();

vi.mock('@opentelemetry/api', () => ({
  trace: {
    getTracer: () => ({
      startActiveSpan: (
        _name: string,
        fn: (span: { end: () => void }) => unknown,
      ) => fn({ end: mockSpanEnd }),
    }),
  },
}));

import { CommandBus } from '../command-bus';
import { Command, Result, DomainException, type IObservabilityService } from '@/core/shared/domain';

class TestException extends DomainException {
  constructor() {
    super('Test failed', 'TEST_ERROR');
  }
}

type TestResponse = Result<string, DomainException>;

class TestCommand extends Command<TestResponse> {
  constructor(readonly value: string) {
    super();
  }
}

const _mockObservability = (): IObservabilityService => ({
  recordHandlerFailure: vi.fn(),
});

describe('CommandBus', () => {
  describe('dispatch', () => {
    it('returns the handler result on success', async () => {
      const bus = new CommandBus(_mockObservability());

      bus.register(TestCommand, {
        execute: vi.fn().mockResolvedValue(Result.ok('hello')),
      });

      const result = await bus.dispatch(new TestCommand('input'));

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('hello');
    });

    it('returns the handler result on failure', async () => {
      const bus = new CommandBus(_mockObservability());

      bus.register(TestCommand, {
        execute: vi.fn().mockResolvedValue(
          Result.fail(new TestException()),
        ),
      });

      const result = await bus.dispatch(new TestCommand('input'));

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(TestException);
    });

    it('re-throws unexpected handler errors', async () => {
      const bus = new CommandBus(_mockObservability());

      bus.register(TestCommand, {
        execute: vi.fn().mockRejectedValue(new Error('unexpected')),
      });

      await expect(
        bus.dispatch(new TestCommand('input')),
      ).rejects.toThrow('unexpected');
    });

    it('records handler failure on unexpected error', async () => {
      const observability = _mockObservability();
      const bus = new CommandBus(observability);

      bus.register(TestCommand, {
        execute: vi.fn().mockRejectedValue(new Error('unexpected')),
      });

      await expect(
        bus.dispatch(new TestCommand('input')),
      ).rejects.toThrow();

      expect(observability.recordHandlerFailure).toHaveBeenCalledWith(
        'TestCommand',
        expect.any(Error),
      );
    });

    it('ends the span on success', async () => {
      const bus = new CommandBus(_mockObservability());

      bus.register(TestCommand, {
        execute: vi.fn().mockResolvedValue(Result.ok('hello')),
      });

      await bus.dispatch(new TestCommand('input'));

      expect(mockSpanEnd).toHaveBeenCalled();
    });

    it('throws when no handler is registered', async () => {
      const bus = new CommandBus(_mockObservability());

      await expect(
        bus.dispatch(new TestCommand('input')),
      ).rejects.toThrow('No handler registered for command');
    });
  });
});
