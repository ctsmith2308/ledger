import { describe, it, expect, vi } from 'vitest';
import { type Transaction as PlaidSDKTransaction } from 'plaid';

import {
  type IEventBus,
  type DomainEvent,
  TransactionEvents,
} from '@/core/shared/domain';

import {
  type IPlaidClient,
  type IPlaidItemRepository,
  type PlaidSyncResult,
  PlaidItem,
} from '@/core/modules/banking/domain';

import {
  type ITransactionRepository,
  Transaction,
} from '@/core/modules/transactions/domain';

import { SyncTransactionsHandler } from '../sync-transactions.handler';
import { SyncTransactionsCommand } from '../sync-transactions.command';

const _makePlaidTransaction = (
  overrides: Partial<PlaidSDKTransaction> = {},
): PlaidSDKTransaction =>
  ({
    transaction_id: 'txn-1',
    account_id: 'acct-1',
    amount: 42.5,
    date: '2026-03-15',
    name: 'Coffee Shop',
    merchant_name: 'Blue Bottle',
    personal_finance_category: {
      primary: 'FOOD_AND_DRINK',
      detailed: 'COFFEE',
    },
    pending: false,
    payment_channel: 'in store',
    ...overrides,
  }) as PlaidSDKTransaction;

const _makeSyncResult = (
  overrides: Partial<PlaidSyncResult> = {},
): PlaidSyncResult => ({
  added: [],
  modified: [],
  removed: [],
  nextCursor: 'cursor-next',
  hasMore: false,
  ...overrides,
});

const _makePlaidItem = (cursor?: string): PlaidItem =>
  PlaidItem.reconstitute(
    'item-1',
    'user-1',
    'access-token-xyz',
    'ins_1',
    cursor,
    new Date('2026-01-01'),
  );

const _makeExistingTransaction = (
  id: string,
  overrides: Partial<{
    amount: number;
    merchantName: string | undefined;
  }> = {},
): Transaction =>
  Transaction.reconstitute(
    id,
    'acct-1',
    'user-1',
    overrides.amount ?? 42.5,
    new Date('2026-03-15'),
    'Coffee Shop',
    overrides.merchantName ?? 'Blue Bottle',
    'FOOD_AND_DRINK',
    'COFFEE',
    false,
    'in store',
    new Date(),
    new Date(),
  );

const _makeHandler = (
  overrides: {
    plaidItemRepository?: Partial<IPlaidItemRepository>;
    transactionRepository?: Partial<ITransactionRepository>;
    plaidClient?: Partial<IPlaidClient>;
    eventBus?: Partial<IEventBus>;
  } = {},
) => {
  const plaidItemRepository: IPlaidItemRepository = {
    save: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn().mockResolvedValue([_makePlaidItem()]),
    updateCursor: vi.fn(),
    deleteById: vi.fn(),
    ...overrides.plaidItemRepository,
  };

  const transactionRepository: ITransactionRepository = {
    save: vi.fn(),
    saveMany: vi.fn(),
    findById: vi.fn(),
    findByIds: vi.fn().mockResolvedValue([]),
    findByUserId: vi.fn(),
    findByAccountId: vi.fn(),
    findByUserIdAndCategory: vi.fn(),
    deleteByIds: vi.fn(),
    deleteByAccountIds: vi.fn(),
    ...overrides.transactionRepository,
  };

  const plaidClient: IPlaidClient = {
    createLinkToken: vi.fn(),
    exchangePublicToken: vi.fn(),
    getAccounts: vi.fn(),
    syncTransactions: vi.fn().mockResolvedValue(_makeSyncResult()),
    itemRemove: vi.fn(),
    ...overrides.plaidClient,
  };

  const eventBus: IEventBus = {
    dispatch: vi.fn(),
    register: vi.fn(),
    ...overrides.eventBus,
  };

  const handler = new SyncTransactionsHandler(
    plaidItemRepository,
    transactionRepository,
    plaidClient,
    eventBus,
  );

  return {
    handler,
    plaidItemRepository,
    transactionRepository,
    plaidClient,
    eventBus,
  };
};

const command = new SyncTransactionsCommand('user-1');

describe('SyncTransactionsHandler', () => {
  describe('when there are no plaid items', () => {
    it('returns zero counts and does not call plaid', async () => {
      const { handler, plaidClient } = _makeHandler({
        plaidItemRepository: { findByUserId: vi.fn().mockResolvedValue([]) },
      });

      const result = await handler.execute(command);

      expect(result.getValueOrThrow()).toEqual({
        added: 0,
        modified: 0,
        removed: 0,
      });
      expect(plaidClient.syncTransactions).not.toHaveBeenCalled();
    });
  });

  describe('added transactions', () => {
    it('saves new transactions and dispatches creation events', async () => {
      const plaidTxn = _makePlaidTransaction();
      const { handler, transactionRepository, eventBus } = _makeHandler({
        plaidClient: {
          syncTransactions: vi.fn().mockResolvedValue(
            _makeSyncResult({ added: [plaidTxn] }),
          ),
        },
      });

      await handler.execute(command);

      expect(transactionRepository.saveMany).toHaveBeenCalledTimes(1);
      const saved = (transactionRepository.saveMany as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as Transaction[];
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('txn-1');
      expect(saved[0].amount).toBe(42.5);
      expect(saved[0].category).toBe('FOOD_AND_DRINK');

      expect(eventBus.dispatch).toHaveBeenCalledTimes(1);
      const events = (eventBus.dispatch as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as DomainEvent[];
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe(
        TransactionEvents.TRANSACTION_CREATED,
      );
    });

    it('returns the count of added transactions', async () => {
      const txns = [
        _makePlaidTransaction({ transaction_id: 'txn-1' }),
        _makePlaidTransaction({ transaction_id: 'txn-2' }),
      ];
      const { handler } = _makeHandler({
        plaidClient: {
          syncTransactions: vi.fn().mockResolvedValue(
            _makeSyncResult({ added: txns }),
          ),
        },
      });

      const result = await handler.execute(command);

      expect(result.getValueOrThrow().added).toBe(2);
    });

    it('maps nullable plaid fields to undefined', async () => {
      const plaidTxn = _makePlaidTransaction({
        merchant_name: null,
        personal_finance_category: null,
        payment_channel: null,
      } as unknown as Partial<PlaidSDKTransaction>);

      const { handler, transactionRepository } = _makeHandler({
        plaidClient: {
          syncTransactions: vi.fn().mockResolvedValue(
            _makeSyncResult({ added: [plaidTxn] }),
          ),
        },
      });

      await handler.execute(command);

      const saved = (transactionRepository.saveMany as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as Transaction[];
      expect(saved[0].merchantName).toBeUndefined();
      expect(saved[0].category).toBeUndefined();
    });
  });

  describe('modified transactions', () => {
    it('updates existing transactions with new data', async () => {
      const existing = _makeExistingTransaction('txn-1');

      const modifiedPlaid = _makePlaidTransaction({
        transaction_id: 'txn-1',
        amount: 55.0,
        merchant_name: 'Starbucks',
      });

      const { handler, transactionRepository } = _makeHandler({
        plaidClient: {
          syncTransactions: vi.fn().mockResolvedValue(
            _makeSyncResult({ modified: [modifiedPlaid] }),
          ),
        },
        transactionRepository: {
          findByIds: vi.fn().mockResolvedValue([existing]),
        },
      });

      await handler.execute(command);

      expect(transactionRepository.saveMany).toHaveBeenCalledTimes(1);
      const saved = (transactionRepository.saveMany as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as Transaction[];
      expect(saved[0].amount).toBe(55.0);
      expect(saved[0].merchantName).toBe('Starbucks');
    });

    it('dispatches SyncMismatchEvent for transactions not found in DB', async () => {
      const modifiedPlaid = _makePlaidTransaction({
        transaction_id: 'txn-missing',
      });

      const { handler, transactionRepository, eventBus } = _makeHandler({
        plaidClient: {
          syncTransactions: vi.fn().mockResolvedValue(
            _makeSyncResult({ modified: [modifiedPlaid] }),
          ),
        },
        transactionRepository: {
          findByIds: vi.fn().mockResolvedValue([]),
        },
      });

      const result = await handler.execute(command);

      expect(transactionRepository.saveMany).not.toHaveBeenCalled();
      expect(result.getValueOrThrow().modified).toBe(1);

      expect(eventBus.dispatch).toHaveBeenCalledTimes(1);
      const events = (eventBus.dispatch as ReturnType<typeof vi.fn>)
        .mock.calls[0][0] as DomainEvent[];
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe(TransactionEvents.SYNC_MISMATCH);
    });
  });

  describe('removed transactions', () => {
    it('deletes by plaid ids and returns the count', async () => {
      const { handler, transactionRepository } = _makeHandler({
        plaidClient: {
          syncTransactions: vi.fn().mockResolvedValue(
            _makeSyncResult({ removed: ['txn-1', 'txn-2'] }),
          ),
        },
      });

      const result = await handler.execute(command);

      expect(transactionRepository.deleteByIds).toHaveBeenCalledWith([
        'txn-1',
        'txn-2',
      ]);
      expect(result.getValueOrThrow().removed).toBe(2);
    });
  });

  describe('cursor management', () => {
    it('passes the existing cursor to plaid sync', async () => {
      const item = _makePlaidItem('existing-cursor');
      const { handler, plaidClient } = _makeHandler({
        plaidItemRepository: {
          findByUserId: vi.fn().mockResolvedValue([item]),
        },
      });

      await handler.execute(command);

      expect(plaidClient.syncTransactions).toHaveBeenCalledWith(
        'access-token-xyz',
        'existing-cursor',
      );
    });

    it('passes undefined cursor on first sync', async () => {
      const item = _makePlaidItem(undefined);
      const { handler, plaidClient } = _makeHandler({
        plaidItemRepository: {
          findByUserId: vi.fn().mockResolvedValue([item]),
        },
      });

      await handler.execute(command);

      expect(plaidClient.syncTransactions).toHaveBeenCalledWith(
        'access-token-xyz',
        undefined,
      );
    });

    it('persists the new cursor after each batch', async () => {
      const { handler, plaidItemRepository } = _makeHandler({
        plaidClient: {
          syncTransactions: vi.fn().mockResolvedValue(
            _makeSyncResult({ nextCursor: 'new-cursor' }),
          ),
        },
      });

      await handler.execute(command);

      expect(plaidItemRepository.updateCursor).toHaveBeenCalledWith(
        'item-1',
        'new-cursor',
      );
    });
  });

  describe('pagination', () => {
    it('continues syncing while hasMore is true and chains cursors', async () => {
      const syncMock = vi
        .fn()
        .mockResolvedValueOnce(
          _makeSyncResult({
            added: [_makePlaidTransaction({ transaction_id: 'txn-1' })],
            nextCursor: 'cursor-page-2',
            hasMore: true,
          }),
        )
        .mockResolvedValueOnce(
          _makeSyncResult({
            added: [_makePlaidTransaction({ transaction_id: 'txn-2' })],
            nextCursor: 'cursor-page-3',
            hasMore: false,
          }),
        );

      const { handler, plaidClient, plaidItemRepository } = _makeHandler({
        plaidClient: { syncTransactions: syncMock },
      });

      const result = await handler.execute(command);

      expect(plaidClient.syncTransactions).toHaveBeenCalledTimes(2);
      expect(syncMock).toHaveBeenNthCalledWith(
        2,
        'access-token-xyz',
        'cursor-page-2',
      );
      expect(result.getValueOrThrow().added).toBe(2);
      expect(plaidItemRepository.updateCursor).toHaveBeenCalledTimes(2);
      expect(plaidItemRepository.updateCursor).toHaveBeenLastCalledWith(
        'item-1',
        'cursor-page-3',
      );
    });
  });

  describe('multiple plaid items', () => {
    it('syncs each item independently', async () => {
      const item1 = _makePlaidItem('cursor-1');
      const item2 = PlaidItem.reconstitute(
        'item-2',
        'user-1',
        'access-token-2',
        'ins_2',
        'cursor-2',
        new Date(),
      );

      const syncMock = vi.fn().mockResolvedValue(
        _makeSyncResult({
          added: [_makePlaidTransaction()],
        }),
      );

      const { handler, plaidClient } = _makeHandler({
        plaidItemRepository: {
          findByUserId: vi.fn().mockResolvedValue([item1, item2]),
        },
        plaidClient: { syncTransactions: syncMock },
      });

      const result = await handler.execute(command);

      expect(plaidClient.syncTransactions).toHaveBeenCalledTimes(2);
      expect(syncMock).toHaveBeenCalledWith('access-token-xyz', 'cursor-1');
      expect(syncMock).toHaveBeenCalledWith('access-token-2', 'cursor-2');
      expect(result.getValueOrThrow().added).toBe(2);
    });
  });

  describe('mixed operations in a single batch', () => {
    it('handles added, modified, and removed in parallel', async () => {
      const existing = _makeExistingTransaction('txn-mod');

      const { handler, transactionRepository } = _makeHandler({
        plaidClient: {
          syncTransactions: vi.fn().mockResolvedValue(
            _makeSyncResult({
              added: [_makePlaidTransaction({ transaction_id: 'txn-new' })],
              modified: [
                _makePlaidTransaction({
                  transaction_id: 'txn-mod',
                  name: 'Updated',
                }),
              ],
              removed: ['txn-old'],
            }),
          ),
        },
        transactionRepository: {
          findByIds: vi.fn().mockResolvedValue([existing]),
        },
      });

      const result = await handler.execute(command);

      const value = result.getValueOrThrow();
      expect(value.added).toBe(1);
      expect(value.modified).toBe(1);
      expect(value.removed).toBe(1);
      expect(transactionRepository.saveMany).toHaveBeenCalledTimes(2);
      expect(transactionRepository.deleteByIds).toHaveBeenCalledWith([
        'txn-old',
      ]);
    });
  });

  describe('event dispatch', () => {
    it('does not dispatch events when no transactions are added', async () => {
      const { handler, eventBus } = _makeHandler({
        plaidClient: {
          syncTransactions: vi.fn().mockResolvedValue(
            _makeSyncResult({ removed: ['txn-1'] }),
          ),
        },
      });

      await handler.execute(command);

      expect(eventBus.dispatch).not.toHaveBeenCalled();
    });
  });
});
