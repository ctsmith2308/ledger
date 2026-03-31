import {
  IHandler,
  Result,
  BudgetNotFoundException,
} from '@/core/shared/domain';

import { IBudgetRepository } from '@/core/modules/budgets/domain';

import {
  UpdateBudgetCommand,
  UpdateBudgetResponse,
} from './update-budget.command';

class UpdateBudgetHandler
  implements IHandler<UpdateBudgetCommand, UpdateBudgetResponse>
{
  constructor(
    private readonly budgetRepository: IBudgetRepository,
  ) {}

  async execute(command: UpdateBudgetCommand): Promise<UpdateBudgetResponse> {
    const budget = await this.budgetRepository.findById(command.budgetId);

    if (!budget || budget.userId !== command.userId) {
      return Result.fail(new BudgetNotFoundException());
    }

    budget.updateLimit(command.monthlyLimit);

    await this.budgetRepository.save(budget);

    return Result.ok(budget);
  }
}

export { UpdateBudgetHandler };
