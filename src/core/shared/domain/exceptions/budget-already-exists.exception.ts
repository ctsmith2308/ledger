import { DomainException } from './base.exception';

class BudgetAlreadyExistsException extends DomainException {
  constructor() {
    super('A budget for this category already exists.', 'BUDGET_ALREADY_EXISTS');
  }
}

export { BudgetAlreadyExistsException };
