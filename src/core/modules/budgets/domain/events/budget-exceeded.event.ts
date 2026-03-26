import { DomainEvent, BudgetEvents } from '@/core/shared/domain';

class BudgetExceededEvent extends DomainEvent {
  readonly userId: string;
  readonly category: string;
  readonly currentSpend: number;
  readonly monthlyLimit: number;

  constructor(
    aggregateId: string,
    userId: string,
    category: string,
    currentSpend: number,
    monthlyLimit: number,
  ) {
    super(aggregateId, BudgetEvents.BUDGET_EXCEEDED);
    this.userId = userId;
    this.category = category;
    this.currentSpend = currentSpend;
    this.monthlyLimit = monthlyLimit;
  }
}

export { BudgetExceededEvent };
