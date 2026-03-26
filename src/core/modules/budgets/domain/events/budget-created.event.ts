import { DomainEvent, BudgetEvents } from '@/core/shared/domain';

class BudgetCreatedEvent extends DomainEvent {
  readonly userId: string;
  readonly category: string;
  readonly monthlyLimit: number;

  constructor(
    aggregateId: string,
    userId: string,
    category: string,
    monthlyLimit: number,
  ) {
    super(aggregateId, BudgetEvents.BUDGET_CREATED);
    this.userId = userId;
    this.category = category;
    this.monthlyLimit = monthlyLimit;
  }
}

export { BudgetCreatedEvent };
