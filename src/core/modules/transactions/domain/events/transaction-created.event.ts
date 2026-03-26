import { DomainEvent, TransactionEvents } from '@/core/shared/domain';

class TransactionCreatedEvent extends DomainEvent {
  readonly userId: string;
  readonly amount: number;
  readonly category: string | undefined;

  constructor(
    aggregateId: string,
    userId: string,
    amount: number,
    category?: string,
  ) {
    super(aggregateId, TransactionEvents.TRANSACTION_CREATED);
    this.userId = userId;
    this.amount = amount;
    this.category = category;
  }
}

export { TransactionCreatedEvent };
