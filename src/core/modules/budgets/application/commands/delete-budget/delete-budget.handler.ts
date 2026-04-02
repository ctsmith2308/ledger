import {
  IHandler,
  Result,
  BudgetNotFoundException,
} from '@/core/shared/domain';

import { IBudgetRepository } from '@/core/modules/budgets/domain';

import {
  DeleteBudgetCommand,
  DeleteBudgetResponse,
} from './delete-budget.command';

class DeleteBudgetHandler implements IHandler<
  DeleteBudgetCommand,
  DeleteBudgetResponse
> {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(command: DeleteBudgetCommand): Promise<DeleteBudgetResponse> {
    const budget = await this.budgetRepository.findById(command.budgetId);

    if (!budget || budget.userId !== command.userId) {
      return Result.fail(new BudgetNotFoundException());
    }

    await this.budgetRepository.deleteById(command.budgetId);

    return Result.ok(undefined);
  }
}

export { DeleteBudgetHandler };
