import { AggregateRoot } from '@/core/shared/domain';
import { BudgetCreatedEvent } from '../events';

class Budget extends AggregateRoot {
  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _category: string,
    private _monthlyLimit: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    super();
  }

  static create(
    id: string,
    userId: string,
    category: string,
    monthlyLimit: number,
  ): Budget {
    const now = new Date();
    const budget = new Budget(
      id,
      userId,
      category,
      monthlyLimit,
      now,
      now,
    );

    budget.addDomainEvent(
      new BudgetCreatedEvent(id, userId, category, monthlyLimit),
    );

    return budget;
  }

  static reconstitute(
    id: string,
    userId: string,
    category: string,
    monthlyLimit: number,
    createdAt: Date,
    updatedAt: Date,
  ): Budget {
    return new Budget(id, userId, category, monthlyLimit, createdAt, updatedAt);
  }

  updateLimit(newLimit: number): void {
    this._monthlyLimit = newLimit;
    this._updatedAt = new Date();
  }

  get id() {
    return this._id;
  }

  get userId() {
    return this._userId;
  }

  get category() {
    return this._category;
  }

  get monthlyLimit() {
    return this._monthlyLimit;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }
}

export { Budget };
