import { Command, DomainException, Result } from '@/core/shared/domain';

type DeleteBudgetResponse = Result<void, DomainException>;

class DeleteBudgetCommand extends Command<DeleteBudgetResponse> {
  static readonly type = 'DeleteBudgetCommand';

  constructor(
    readonly userId: string,
    readonly budgetId: string,
  ) {
    super();
  }
}

export { DeleteBudgetCommand, type DeleteBudgetResponse };
