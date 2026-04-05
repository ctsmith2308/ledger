import { describe, it, expect, vi } from 'vitest';

import {
  type IEventBus,
  PlaidItemNotFoundException,
  UnauthorizedException,
} from '@/core/shared/domain';

import {
  type IPlaidItemRepository,
  type IBankAccountRepository,
  type IPlaidClient,
  PlaidItem,
  BankAccount,
  BankAccountUnlinkedEvent,
} from '@/core/modules/banking/domain';

import { type ITransactionRepository } from '@/core/modules/transactions/domain';

import { UnlinkBankHandler } from '../unlink-bank.handler';
import { UnlinkBankCommand } from '../unlink-bank.command';

const _existingPlaidItem = (overrides?: { userId?: string; id?: string }) =>
  PlaidItem.reconstitute(
    overrides?.id ?? 'plaid-item-1',
    overrides?.userId ?? 'user-1',
    'access-token-xyz',
    'ins_1',
    undefined,
    new Date('2026-01-01'),
  );

const _bankAccount = (id: string) =>
  BankAccount.reconstitute(
    id,
    'plaid-item-1',
    'Checking',
    undefined,
    undefined,
    'depository',
    'checking',
    100,
    100,
    'USD',
    new Date('2026-01-01'),
    new Date('2026-01-01'),
  );

const _makeHandler = (
  overrides: {
    plaidClient?: Partial<IPlaidClient>;
    plaidItemRepository?: Partial<IPlaidItemRepository>;
    bankAccountRepository?: Partial<IBankAccountRepository>;
    transactionRepository?: Partial<ITransactionRepository>;
    eventBus?: Partial<IEventBus>;
  } = {},
) => {
  const plaidClient: IPlaidClient = {
    createLinkToken: vi.fn(),
    exchangePublicToken: vi.fn(),
    getAccounts: vi.fn(),
    syncTransactions: vi.fn(),
    itemRemove: vi.fn().mockResolvedValue(undefined),
    ...overrides.plaidClient,
  };

  const plaidItemRepository: IPlaidItemRepository = {
    save: vi.fn(),
    findById: vi.fn().mockResolvedValue(_existingPlaidItem()),
    findByUserId: vi.fn(),
    updateCursor: vi.fn(),
    deleteById: vi.fn().mockResolvedValue(undefined),
    ...overrides.plaidItemRepository,
  };

  const bankAccountRepository: IBankAccountRepository = {
    saveMany: vi.fn(),
    findByPlaidItemId: vi
      .fn()
      .mockResolvedValue([_bankAccount('acc-1'), _bankAccount('acc-2')]),
    findByUserId: vi.fn(),
    findById: vi.fn(),
    ...overrides.bankAccountRepository,
  };

  const transactionRepository: ITransactionRepository = {
    save: vi.fn(),
    saveMany: vi.fn(),
    findById: vi.fn(),
    findByIds: vi.fn(),
    findByUserId: vi.fn(),
    findByAccountId: vi.fn(),
    findByUserIdAndCategory: vi.fn(),
    deleteByIds: vi.fn(),
    deleteByAccountIds: vi.fn().mockResolvedValue(undefined),
    ...overrides.transactionRepository,
  };

  const eventBus: IEventBus = {
    dispatch: vi.fn().mockResolvedValue(undefined),
    register: vi.fn(),
    ...overrides.eventBus,
  };

  const handler = new UnlinkBankHandler(
    plaidClient,
    plaidItemRepository,
    bankAccountRepository,
    transactionRepository,
    eventBus,
  );

  return {
    handler,
    plaidClient,
    plaidItemRepository,
    bankAccountRepository,
    transactionRepository,
    eventBus,
  };
};

describe('UnlinkBankHandler', () => {
  const validCommand = new UnlinkBankCommand('user-1', 'plaid-item-1');

  describe('success path', () => {
    it('calls Plaid itemRemove with the access token', async () => {
      const { handler, plaidClient } = _makeHandler();

      await handler.execute(validCommand);

      expect(plaidClient.itemRemove).toHaveBeenCalledWith('access-token-xyz');
    });

    it('deletes transactions for all accounts tied to the item', async () => {
      const { handler, transactionRepository } = _makeHandler();

      await handler.execute(validCommand);

      expect(transactionRepository.deleteByAccountIds).toHaveBeenCalledWith([
        'acc-1',
        'acc-2',
      ]);
    });

    it('deletes the plaid item', async () => {
      const { handler, plaidItemRepository } = _makeHandler();

      await handler.execute(validCommand);

      expect(plaidItemRepository.deleteById).toHaveBeenCalledWith(
        'plaid-item-1',
      );
    });

    it('dispatches BankAccountUnlinkedEvent', async () => {
      const { handler, eventBus } = _makeHandler();

      await handler.execute(validCommand);

      expect(eventBus.dispatch).toHaveBeenCalledTimes(1);
      const [dispatched] = (eventBus.dispatch as ReturnType<typeof vi.fn>).mock
        .calls[0];
      expect(dispatched).toHaveLength(1);
      expect(dispatched[0]).toBeInstanceOf(BankAccountUnlinkedEvent);
      expect(dispatched[0].aggregateId).toBe('plaid-item-1');
      expect(dispatched[0].userId).toBe('user-1');
      expect(dispatched[0].institutionId).toBe('ins_1');
    });

    it('returns success', async () => {
      const { handler } = _makeHandler();

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
    });

    it('skips transaction deletion when the item has no accounts', async () => {
      const { handler, transactionRepository } = _makeHandler({
        bankAccountRepository: {
          findByPlaidItemId: vi.fn().mockResolvedValue([]),
        },
      });

      await handler.execute(validCommand);

      expect(transactionRepository.deleteByAccountIds).not.toHaveBeenCalled();
    });
  });

  describe('plaid item not found', () => {
    it('fails with PlaidItemNotFoundException', async () => {
      const { handler } = _makeHandler({
        plaidItemRepository: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(PlaidItemNotFoundException);
    });

    it('does not call Plaid or delete anything', async () => {
      const { handler, plaidClient, plaidItemRepository, transactionRepository } =
        _makeHandler({
          plaidItemRepository: {
            findById: vi.fn().mockResolvedValue(null),
            deleteById: vi.fn(),
          },
        });

      await handler.execute(validCommand);

      expect(plaidClient.itemRemove).not.toHaveBeenCalled();
      expect(transactionRepository.deleteByAccountIds).not.toHaveBeenCalled();
      expect(plaidItemRepository.deleteById).not.toHaveBeenCalled();
    });

    it('does not dispatch an event', async () => {
      const { handler, eventBus } = _makeHandler({
        plaidItemRepository: {
          findById: vi.fn().mockResolvedValue(null),
        },
      });

      await handler.execute(validCommand);

      expect(eventBus.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('ownership mismatch', () => {
    it('fails with UnauthorizedException when plaid item belongs to another user', async () => {
      const { handler } = _makeHandler({
        plaidItemRepository: {
          findById: vi
            .fn()
            .mockResolvedValue(_existingPlaidItem({ userId: 'user-2' })),
        },
      });

      const result = await handler.execute(validCommand);

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeInstanceOf(UnauthorizedException);
    });

    it('does not call Plaid or delete anything on ownership mismatch', async () => {
      const { handler, plaidClient, plaidItemRepository, transactionRepository } =
        _makeHandler({
          plaidItemRepository: {
            findById: vi
              .fn()
              .mockResolvedValue(_existingPlaidItem({ userId: 'user-2' })),
            deleteById: vi.fn(),
          },
        });

      await handler.execute(validCommand);

      expect(plaidClient.itemRemove).not.toHaveBeenCalled();
      expect(transactionRepository.deleteByAccountIds).not.toHaveBeenCalled();
      expect(plaidItemRepository.deleteById).not.toHaveBeenCalled();
    });
  });

  describe('plaid itemRemove failure tolerance', () => {
    it('still completes local cleanup when Plaid itemRemove throws', async () => {
      const { handler, transactionRepository, plaidItemRepository, eventBus } =
        _makeHandler({
          plaidClient: {
            itemRemove: vi.fn().mockRejectedValue(new Error('Plaid down')),
          },
        });

      const result = await handler.execute(validCommand);

      expect(result.isSuccess).toBe(true);
      expect(transactionRepository.deleteByAccountIds).toHaveBeenCalledWith([
        'acc-1',
        'acc-2',
      ]);
      expect(plaidItemRepository.deleteById).toHaveBeenCalledWith(
        'plaid-item-1',
      );
      expect(eventBus.dispatch).toHaveBeenCalledTimes(1);
    });
  });
});
