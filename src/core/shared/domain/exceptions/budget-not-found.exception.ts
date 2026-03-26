import { DomainException } from './base.exception';

class BudgetNotFoundException extends DomainException {
  constructor(message = 'Budget not found.') {
    super(message, 'BUDGET_NOT_FOUND');
  }
}

export { BudgetNotFoundException };
