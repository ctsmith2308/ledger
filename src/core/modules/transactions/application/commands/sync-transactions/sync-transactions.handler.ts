import { IHandler, IEventBus, Result, DomainEvent } from '@/core/shared/domain';
import {
  ITransactionRepository,
  Transaction,
} from '@/core/modules/transactions/domain';
import {
  IPlaidItemRepository,
  IPlaidClient,
  type PlaidTransactionData,
} from '@/core/modules/banking/domain';
import { IIdGenerator } from '@/core/shared/domain';

import {
  SyncTransactionsCommand,
  SyncTransactionsResponse,
} from './sync-transactions.command';

class SyncTransactionsHandler
  implements IHandler<SyncTransactionsCommand, SyncTransactionsResponse>
{
  constructor(
    private readonly plaidItemRepository: IPlaidItemRepository,
    private readonly transactionRepository: ITransactionRepository,
    private readonly plaidClient: IPlaidClient,
    private readonly eventBus: IEventBus,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async execute(
    command: SyncTransactionsCommand,
  ): Promise<SyncTransactionsResponse> {
    const items = await this.plaidItemRepository.findByUserId(command.userId);

    let addedCount = 0;
    let modifiedCount = 0;
    let removedCount = 0;
    const allEvents: DomainEvent[] = [];

    for (const item of items) {
      const counts = await this._syncItem(
        item.id,
        item.accessToken,
        item.cursor,
        command.userId,
        allEvents,
      );

      addedCount += counts.added;
      modifiedCount += counts.modified;
      removedCount += counts.removed;
    }

    await this.eventBus.dispatch(allEvents);

    return Result.ok({
      added: addedCount,
      modified: modifiedCount,
      removed: removedCount,
    });
  }

  private async _syncItem(
    itemId: string,
    accessToken: string,
    cursor: string | undefined,
    userId: string,
    allEvents: DomainEvent[],
  ): Promise<{ added: number; modified: number; removed: number }> {
    let currentCursor = cursor;
    let hasMore = true;
    let addedCount = 0;
    let modifiedCount = 0;
    let removedCount = 0;

    while (hasMore) {
      const syncResult = await this.plaidClient.syncTransactions(
        accessToken,
        currentCursor,
      );

      const newTransactions = await this._processAdded(
        syncResult.added,
        userId,
      );
      addedCount += newTransactions.length;

      for (const transaction of newTransactions) {
        const events = transaction.pullDomainEvents();
        allEvents.push(...events);
      }

      const modifiedTransactions = await this._processModified(
        syncResult.modified,
      );
      modifiedCount += modifiedTransactions.length;

      if (syncResult.removed.length > 0) {
        await this.transactionRepository.deleteByPlaidTransactionIds(
          syncResult.removed,
        );
        removedCount += syncResult.removed.length;
      }

      if (newTransactions.length > 0) {
        await this.transactionRepository.saveMany(newTransactions);
      }

      if (modifiedTransactions.length > 0) {
        await this.transactionRepository.saveMany(modifiedTransactions);
      }

      currentCursor = syncResult.nextCursor;
      hasMore = syncResult.hasMore;
    }

    await this.plaidItemRepository.updateCursor(
      itemId,
      currentCursor as string,
    );

    return { added: addedCount, modified: modifiedCount, removed: removedCount };
  }

  private async _processAdded(
    added: PlaidTransactionData[],
    userId: string,
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];

    for (const data of added) {
      const transaction = Transaction.create(
        this.idGenerator.generate(),
        data.accountId,
        userId,
        data.transactionId,
        data.amount,
        new Date(data.date),
        data.name,
        data.merchantName ?? undefined,
        data.category ?? undefined,
        data.detailedCategory ?? undefined,
        data.pending,
        data.paymentChannel ?? undefined,
      );

      transactions.push(transaction);
    }

    return transactions;
  }

  private async _processModified(
    modified: PlaidTransactionData[],
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = [];

    for (const data of modified) {
      const existing =
        await this.transactionRepository.findByPlaidTransactionId(
          data.transactionId,
        );

      if (!existing) continue;

      existing.update({
        amount: data.amount,
        date: new Date(data.date),
        name: data.name,
        merchantName: data.merchantName ?? undefined,
        category: data.category ?? undefined,
        detailedCategory: data.detailedCategory ?? undefined,
        pending: data.pending,
        paymentChannel: data.paymentChannel ?? undefined,
      });

      transactions.push(existing);
    }

    return transactions;
  }
}

export { SyncTransactionsHandler };
