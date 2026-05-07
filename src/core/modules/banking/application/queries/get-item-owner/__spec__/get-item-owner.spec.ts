import { describe, it, expect, vi } from 'vitest';

import { PlaidItemNotFoundException } from '@/core/shared/domain';

import {
  type IPlaidItemRepository,
  PlaidItem,
} from '@/core/modules/banking/domain';

import { GetItemOwnerHandler } from '../get-item-owner.handler';
import { GetItemOwnerQuery } from '../get-item-owner.query';

const _makeRepository = (
  overrides: Partial<IPlaidItemRepository> = {},
): IPlaidItemRepository => ({
  save: vi.fn(),
  findById: vi.fn().mockResolvedValue(null),
  findByUserId: vi.fn(),
  updateCursor: vi.fn(),
  deleteById: vi.fn(),
  ...overrides,
});

const _makePlaidItem = (): PlaidItem =>
  PlaidItem.reconstitute(
    'item-1',
    'user-1',
    'access-token-xyz',
    'ins_1',
    undefined,
    new Date('2026-01-01'),
  );

describe('GetItemOwnerHandler', () => {
  it('returns the userId when the item exists', async () => {
    const repository = _makeRepository({
      findById: vi.fn().mockResolvedValue(_makePlaidItem()),
    });

    const handler = new GetItemOwnerHandler(repository);

    const result = await handler.execute(new GetItemOwnerQuery('item-1'));

    expect(result.isSuccess).toBe(true);

    expect(result.getValueOrThrow()).toBe('user-1');

    expect(repository.findById).toHaveBeenCalledWith('item-1');
  });

  it('returns Result.fail with PlaidItemNotFoundException when the item does not exist', async () => {
    const repository = _makeRepository();

    const handler = new GetItemOwnerHandler(repository);

    const result = await handler.execute(new GetItemOwnerQuery('nonexistent'));

    expect(result.isFailure).toBe(true);

    expect(result.error).toBeInstanceOf(PlaidItemNotFoundException);
  });
});
