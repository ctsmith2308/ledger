import { DomainEvent, TransactionEvents } from '@/core/shared/domain';

class SyncMismatchEvent extends DomainEvent {
  readonly userId: string;
  readonly plaidTransactionId: string;

  constructor(
    aggregateId: string,
    userId: string,
    plaidTransactionId: string,
  ) {
    super(aggregateId, TransactionEvents.SYNC_MISMATCH);
    this.userId = userId;
    this.plaidTransactionId = plaidTransactionId;
  }
}

export { SyncMismatchEvent };
