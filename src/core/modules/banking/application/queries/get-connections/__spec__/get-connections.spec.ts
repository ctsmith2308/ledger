import { describe, it, expect, vi } from 'vitest';

import {
  type IPlaidItemRepository,
  PlaidItem,
} from '@/core/modules/banking/domain';

import { GetConnectionsHandler } from '../get-connections.handler';
import { GetConnectionsQuery } from '../get-connections.query';

const _existingPlaidItem = (overrides?: { userId?: string; id?: string }) =>
  PlaidItem.reconstitute(
    overrides?.id ?? 'plaid-item-1',
    overrides?.userId ?? 'user-1',
    'access-token-xyz',
    'ins_1',
    undefined,
    new Date('2026-01-01'),
  );

const _makeHandler = (
  overrides: {
    plaidItemRepository?: Partial<IPlaidItemRepository>;
  } = {},
) => {
  const plaidItemRepository: IPlaidItemRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi
      .fn()
      .mockResolvedValue([
        _existingPlaidItem({ id: 'plaid-item-1' }),
        _existingPlaidItem({ id: 'plaid-item-2' }),
      ]),
    updateCursor: vi.fn(),
    deleteById: vi.fn(),
    ...overrides.plaidItemRepository,
  };

  const handler = new GetConnectionsHandler(plaidItemRepository);

  return { handler, plaidItemRepository };
};

describe('GetConnectionsHandler', () => {
  const validQuery = new GetConnectionsQuery('user-1');

  describe('success path', () => {
    it('calls findByUserId with the query userId', async () => {
      const { handler, plaidItemRepository } = _makeHandler();

      await handler.execute(validQuery);

      expect(plaidItemRepository.findByUserId).toHaveBeenCalledWith('user-1');
    });

    it('returns all plaid items for the user', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validQuery);

      expect(result.isSuccess).toBe(true);
      const items = result.getValueOrThrow();
      expect(items).toHaveLength(2);
      expect(items[0].id).toBe('plaid-item-1');
      expect(items[1].id).toBe('plaid-item-2');
    });
  });

  describe('no connections', () => {
    it('returns an empty array when the user has no plaid items', async () => {
      const { handler } = _makeHandler({
        plaidItemRepository: {
          findByUserId: vi.fn().mockResolvedValue([]),
        },
      });

      const result = await handler.execute(validQuery);

      expect(result.isSuccess).toBe(true);
      expect(result.getValueOrThrow()).toEqual([]);
    });
  });
});
