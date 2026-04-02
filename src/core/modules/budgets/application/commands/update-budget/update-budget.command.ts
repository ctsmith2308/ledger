import { Command, DomainException, Result } from '@/core/shared/domain';

import { Budget } from '@/core/modules/budgets/domain';

type UpdateBudgetResponse = Result<Budget, DomainException>;

class UpdateBudgetCommand extends Command<UpdateBudgetResponse> {
  static readonly type = 'UpdateBudgetCommand';

  constructor(
    readonly userId: string,
    readonly budgetId: string,
    readonly monthlyLimit: number,
  ) {
    super();
  }
}

export { UpdateBudgetCommand, type UpdateBudgetResponse };
