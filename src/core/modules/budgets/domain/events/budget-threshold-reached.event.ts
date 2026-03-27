import { DomainEvent, BudgetEvents } from '@/core/shared/domain';

class BudgetThresholdReachedEvent extends DomainEvent {
  readonly userId: string;
  readonly category: string;
  readonly currentSpend: number;
  readonly monthlyLimit: number;
  readonly percent: number;

  constructor(
    aggregateId: string,
    userId: string,
    category: string,
    currentSpend: number,
    monthlyLimit: number,
    percent: number,
  ) {
    super(aggregateId, BudgetEvents.BUDGET_THRESHOLD_REACHED);
    this.userId = userId;
    this.category = category;
    this.currentSpend = currentSpend;
    this.monthlyLimit = monthlyLimit;
    this.percent = percent;
  }
}

export { BudgetThresholdReachedEvent };
