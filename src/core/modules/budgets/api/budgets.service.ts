import { CommandBus, QueryBus } from '@/core/shared/infrastructure';

import {
  CreateBudgetCommand,
  DeleteBudgetCommand,
  UpdateBudgetCommand,
  GetBudgetOverviewQuery,
  GetBudgetsQuery,
} from '../application';

import { BudgetMapper, BudgetOverviewMapper } from './mappers';

import {
  type BudgetDTO,
  type BudgetOverviewItemDTO,
} from './budgets.dto';

class BudgetsService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createBudget(
    userId: string,
    category: string,
    monthlyLimit: number,
  ): Promise<BudgetDTO> {
    const result = await this.commandBus.dispatch(
      new CreateBudgetCommand(userId, category, monthlyLimit),
    );

    return BudgetMapper.toDTO(result.getValueOrThrow());
  }

  async deleteBudget(userId: string, budgetId: string): Promise<void> {
    const result = await this.commandBus.dispatch(
      new DeleteBudgetCommand(userId, budgetId),
    );

    result.getValueOrThrow();
  }

  async updateBudget(
    userId: string,
    budgetId: string,
    monthlyLimit: number,
  ): Promise<BudgetDTO> {
    const result = await this.commandBus.dispatch(
      new UpdateBudgetCommand(userId, budgetId, monthlyLimit),
    );

    return BudgetMapper.toDTO(result.getValueOrThrow());
  }

  async getBudgetOverview(userId: string, month: Date): Promise<BudgetOverviewItemDTO[]> {
    const result = await this.queryBus.dispatch(
      new GetBudgetOverviewQuery(userId, month),
    );

    return BudgetOverviewMapper.toDTOList(result.getValueOrThrow());
  }

  // TODO: Remove — getBudgetOverview supersedes this
  async getBudgets(userId: string): Promise<BudgetDTO[]> {
    const result = await this.queryBus.dispatch(
      new GetBudgetsQuery(userId),
    );

    return BudgetMapper.toDTOList(result.getValueOrThrow());
  }
}

export { BudgetsService };
