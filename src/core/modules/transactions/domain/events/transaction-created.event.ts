import { DomainEvent, TransactionEvents } from '@/core/shared/domain';

class TransactionCreatedEvent extends DomainEvent {
  readonly userId: string;
  readonly amount: number;
  readonly date: Date;
  readonly category: string | undefined;

  constructor(
    aggregateId: string,
    userId: string,
    amount: number,
    date: Date,
    category?: string,
  ) {
    super(aggregateId, TransactionEvents.TRANSACTION_CREATED);
    this.userId = userId;
    this.amount = amount;
    this.date = date;
    this.category = category;
  }
}

export { TransactionCreatedEvent };
