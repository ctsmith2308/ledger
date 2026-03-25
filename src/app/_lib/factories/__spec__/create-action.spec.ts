import { describe, it, expect, vi } from 'vitest';

vi.mock('@/core/shared/infrastructure', () => ({
  toErrorResponse: (err: unknown) => ({
    code: 'TEST_ERROR',
    message: err instanceof Error ? err.message : 'Unknown error',
  }),
  logger: { error: vi.fn() },
}));

vi.mock('../../services', () => ({
  getSessionService: () => ({}),
  getRateLimitService: () => ({}),
}));

import {
  createAction,
  type ActionCtx,
  type Middleware,
} from '../create-action.factory';

describe('createAction', () => {
  describe('handler execution', () => {
    it('returns success with handler data', async () => {
      const handler = async (_ctx: ActionCtx, input: string) =>
        `received: ${input}`;

      const action = createAction(handler);
      const result = await action('hello');

      expect(result).toEqual({ success: true, data: 'received: hello' });
    });

    it('passes an empty context when no middleware', async () => {
      const handler = async (ctx: ActionCtx) => ctx;

      const action = createAction(handler);
      const result = await action(undefined);

      expect(result).toEqual({ success: true, data: {} });
    });
  });

  describe('middleware', () => {
    it('runs middleware in order before handler', async () => {
      const order: string[] = [];

      const first: Middleware = async (ctx) => {
        order.push('first');
        return { ...ctx };
      };

      const second: Middleware = async (ctx) => {
        order.push('second');
        return { ...ctx };
      };

      const handler = async () => {
        order.push('handler');
      };

      const action = createAction(handler, [first, second]);
      await action(undefined);

      expect(order).toEqual(['first', 'second', 'handler']);
    });

    it('enriches context across middleware', async () => {
      const addUserId: Middleware = async (ctx) => ({
        ...ctx,
        userId: 'user-123',
      });

      const handler = async (ctx: ActionCtx) => {
        const { userId } = ctx as { userId: string };
        return userId;
      };

      const action = createAction(handler, [addUserId]);
      const result = await action(undefined);

      expect(result).toEqual({ success: true, data: 'user-123' });
    });

    it('short-circuits on middleware failure', async () => {
      const handlerSpy = vi.fn();

      const failing: Middleware = async () => {
        throw new Error('auth failed');
      };

      const action = createAction(handlerSpy, [failing]);
      const result = await action(undefined);

      expect(result.success).toBe(false);
      expect(handlerSpy).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('catches handler errors and returns failure', async () => {
      const handler = async () => {
        throw new Error('handler blew up');
      };

      const action = createAction(handler);
      const result = await action(undefined);

      expect(result).toEqual({
        success: false,
        code: 'TEST_ERROR',
        message: 'handler blew up',
      });
    });

    it('catches middleware errors and returns failure', async () => {
      const failing: Middleware = async () => {
        throw new Error('middleware blew up');
      };

      const handler = async () => 'should not reach';

      const action = createAction(handler, [failing]);
      const result = await action(undefined);

      expect(result).toEqual({
        success: false,
        code: 'TEST_ERROR',
        message: 'middleware blew up',
      });
    });
  });
});
