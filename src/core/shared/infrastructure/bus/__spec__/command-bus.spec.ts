import { describe, it, expect, vi } from 'vitest';
import { CommandBus } from '../command-bus';
import { Command, Result, DomainException } from '@/core/shared/domain';

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

describe('CommandBus', () => {
  describe('dispatch', () => {
    it('returns the handler result on success', async () => {
      const bus = new CommandBus();

      bus.register(TestCommand, {
        execute: vi.fn().mockResolvedValue(Result.ok('hello')),
      });

      const result = await bus.dispatch(new TestCommand('input'));

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('hello');
    });

    it('returns the handler result on failure', async () => {
      const bus = new CommandBus();

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
      const bus = new CommandBus();

      bus.register(TestCommand, {
        execute: vi.fn().mockRejectedValue(new Error('unexpected')),
      });

      await expect(
        bus.dispatch(new TestCommand('input')),
      ).rejects.toThrow('unexpected');
    });

    it('throws when no handler is registered', async () => {
      const bus = new CommandBus();

      await expect(
        bus.dispatch(new TestCommand('input')),
      ).rejects.toThrow('No handler registered for command');
    });
  });
});
