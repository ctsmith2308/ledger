import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import {
  CreateBudgetCommand,
  DeleteBudgetCommand,
  GetBudgetsQuery,
} from '../application';

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

    return BudgetMapper.toDTO(result.getValueOrThrow());
  }

  async deleteBudget(userId: string, budgetId: string) {
    const result = await this.commandBus.dispatch(
      new DeleteBudgetCommand(userId, budgetId),
    );

    result.getValueOrThrow();
  }

  async getBudgets(userId: string) {
    const result = await this.queryBus.dispatch(
      new GetBudgetsQuery(userId),
    );

    return BudgetMapper.toDTOList(result.getValueOrThrow());
  }
}

export { BudgetsController };
