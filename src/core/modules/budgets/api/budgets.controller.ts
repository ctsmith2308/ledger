import { Result } from '@/core/shared/domain';

import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import { CreateBudgetCommand, GetBudgetsQuery } from '../application';

import { BudgetMapper } from './mappers';

class BudgetsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createBudget(
    userId: string,
    category: string,
    monthlyLimit: number,
  ) {
    const result = await this.commandBus.dispatch(
      new CreateBudgetCommand(userId, category, monthlyLimit),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(BudgetMapper.toDTO(result.value));
  }

  async getBudgets(userId: string) {
    const result = await this.queryBus.dispatch(
      new GetBudgetsQuery(userId),
    );

    return result.isFailure
      ? Result.fail(result.error)
      : Result.ok(BudgetMapper.toDTOList(result.value));
  }
}

export { BudgetsController };
