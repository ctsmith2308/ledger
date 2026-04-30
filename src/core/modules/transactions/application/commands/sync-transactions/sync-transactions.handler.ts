import { Transaction as PlaidSDKTransaction } from 'plaid';

import { IHandler, IEventBus, Result, DomainEvent } from '@/core/shared/domain';

import {
  ITransactionRepository,
  Transaction,
  SyncMismatchEvent,
} from '@/core/modules/transactions/domain';

import {
  IPlaidItemRepository,
  IPlaidClient,
} from '@/core/modules/banking/domain';

import {
  SyncTransactionsCommand,
  SyncTransactionsResponse,
} from './sync-transactions.command';

/**
 * Syncs transactions from Plaid for all linked bank accounts.
 *
 * Uses Plaid's cursor-based /transactions/sync endpoint to pull incremental
 * changes (added, modified, removed) rather than re-fetching everything.
 * https://plaid.com/docs/api/products/transactions/#transactionssync
 *
 * Cursor persistence: the cursor is saved per PlaidItem after each batch
 * so the next sync resumes from where it left off. If the process crashes
 * between the transaction save and the cursor update, the next sync may
 * re-process the same batch. Prisma's upsert on save handles this
 * idempotently.
 *
 * Event dispatch: events are collected per batch and dispatched after all
 * operations complete. TransactionCreatedEvent drives rollup materialization
 * and budget threshold checks. SyncMismatchEvent fires when Plaid reports
 * a modification for a transaction not in the DB (data fell out of sync).
 */
class SyncTransactionsHandler implements IHandler<
  SyncTransactionsCommand,
  SyncTransactionsResponse
> {
  constructor(
    private readonly plaidItemRepository: IPlaidItemRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly plaidClient: IPlaidClient,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(
    command: SyncTransactionsCommand,
  ): Promise<SyncTransactionsResponse> {
    const items = await this.plaidItemRepository.findByUserId(command.userId);

    let added = 0;
    let modified = 0;
    let removed = 0;

    for (const item of items) {
      let currentCursor = item.cursor;
      let hasMore = true;

      /**
       * Plaid returns transactions in pages. Each response includes a
       * next_cursor and a hasMore flag. We loop until hasMore is false,
       * processing added/modified/removed in each batch and advancing
       * the cursor after each page. This ensures large backlogs (initial
       * sync or long gaps between syncs) are fully consumed without
       * missing transactions mid-stream.
       */
      while (hasMore) {
        const syncResult = await this.plaidClient.syncTransactions(
          item.accessToken,
          currentCursor,
        );

        const batchEvents: DomainEvent[] = [];
        const promises: Promise<void>[] = [];

        if (syncResult.removed.length > 0) {
          promises.push(this._handleRemoved(syncResult.removed));
        }

        if (syncResult.added.length > 0) {
          promises.push(
            this._handleAdded(syncResult.added, item.userId, batchEvents),
          );
        }

        if (syncResult.modified.length > 0) {
          promises.push(
            this._handleModified(syncResult.modified, item.userId, batchEvents),
          );
        }

        await Promise.all(promises);

        added += syncResult.added.length;
        modified += syncResult.modified.length;
        removed += syncResult.removed.length;

        currentCursor = syncResult.nextCursor;

        await this.plaidItemRepository.updateCursor(item.id, currentCursor);

        if (batchEvents.length > 0) {
          await this.eventBus.dispatch(batchEvents);
        }

        hasMore = syncResult.hasMore;
      }
    }

    return Result.ok({ added, modified, removed });
  }

  private async _handleRemoved(removed: string[]): Promise<void> {
    await this.transactionRepository.deleteByIds(removed);
  }

  private async _handleAdded(
    added: PlaidSDKTransaction[],
    userId: string,
    batchEvents: DomainEvent[],
  ): Promise<void> {
    const transactions = _mapToTransactions(added, userId);

    await this.transactionRepository.saveMany(transactions);

    for (const transaction of transactions) {
      batchEvents.push(...transaction.pullDomainEvents());
    }
  }

  private async _handleModified(
    modified: PlaidSDKTransaction[],
    userId: string,
    batchEvents: DomainEvent[],
  ): Promise<void> {
    const plaidIds = modified.map((t) => t.transaction_id);

    const existing = await this.transactionRepository.findByIds(plaidIds);

    const updated: Transaction[] = [];

    for (const data of modified) {
      const match = existing.find((t) => t.id === data.transaction_id);

      if (!match) {
        batchEvents.push(
          new SyncMismatchEvent(
            data.transaction_id,
            userId,
            data.transaction_id,
          ),
        );
        continue;
      }

      match.update({
        amount: data.amount,
        date: new Date(data.date),
        name: data.name,
        merchantName: data.merchant_name ?? undefined,
        category: data.personal_finance_category?.primary ?? undefined,
        detailedCategory: data.personal_finance_category?.detailed ?? undefined,
        pending: data.pending,
        paymentChannel: data.payment_channel ?? undefined,
      });

      updated.push(match);
    }

    if (updated.length > 0) {
      await this.transactionRepository.saveMany(updated);
    }
  }
}

const _mapToTransactions = (
  added: PlaidSDKTransaction[],
  userId: string,
): Transaction[] => {
  return added.map((data) =>
    Transaction.create(
      data.transaction_id,
      data.account_id,
      userId,
      data.amount,
      new Date(data.date),
      data.name,
      data.merchant_name ?? undefined,
      data.personal_finance_category?.primary ?? undefined,
      data.personal_finance_category?.detailed ?? undefined,
      data.pending,
      data.payment_channel ?? undefined,
    ),
  );
};

export { SyncTransactionsHandler };
