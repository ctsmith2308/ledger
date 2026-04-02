import { Command, DomainException, Result } from '@/core/shared/domain';

import { Budget } from '@/core/modules/budgets/domain';

type CreateBudgetResponse = Result<Budget, DomainException>;

class CreateBudgetCommand extends Command<CreateBudgetResponse> {
  constructor(
    readonly userId: string,
    readonly category: string,
    readonly monthlyLimit: number,
  ) {
    super();
  }
}

export { CreateBudgetCommand, type CreateBudgetResponse };
