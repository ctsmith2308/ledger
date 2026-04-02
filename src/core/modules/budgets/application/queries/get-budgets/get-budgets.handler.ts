import { IHandler, Result } from '@/core/shared/domain';

import { IBudgetRepository } from '@/core/modules/budgets/domain';

import { GetBudgetsQuery, GetBudgetsResponse } from './get-budgets.query';

class GetBudgetsHandler implements IHandler<
  GetBudgetsQuery,
  GetBudgetsResponse
> {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(query: GetBudgetsQuery): Promise<GetBudgetsResponse> {
    const budgets = await this.budgetRepository.findByUserId(query.userId);

    return Result.ok(budgets);
  }
}

export { GetBudgetsHandler };
