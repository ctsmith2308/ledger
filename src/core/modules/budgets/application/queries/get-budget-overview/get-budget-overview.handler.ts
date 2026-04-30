import { IHandler, Result } from '@/core/shared/domain';

import { type IBudgetRepository } from '@/core/modules/budgets/domain';

import {
  type ICategoryRollupRepository,
  type ITransactionRepository,
} from '@/core/modules/transactions/domain';

import { TransactionMapper } from '@/core/modules/transactions/api/mappers/transaction.mapper';

import {
  GetBudgetOverviewQuery,
  GetBudgetOverviewResponse,
} from './get-budget-overview.query';

const _formatPeriod = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Assembles the budget overview by joining data from three sources:
 * budgets, category rollups (read model), and recent transactions.
 *
 * Budgets and rollups are fetched in parallel. Then for each budget,
 * the 10 most recent transactions for that category are fetched to
 * display in the accordion UI. Spending is read from the rollup (cents
 * converted to dollars), not re-aggregated from raw transactions.
 *
 * Cross-module: reads from ICategoryRollupRepository and
 * ITransactionRepository (transactions module). This is a read-only
 * query that doesn't mutate state in either module.
 */
class GetBudgetOverviewHandler
  implements IHandler<GetBudgetOverviewQuery, GetBudgetOverviewResponse>
{
  constructor(
    private readonly budgetRepository: IBudgetRepository,
    private readonly rollupRepository: ICategoryRollupRepository,
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(
    query: GetBudgetOverviewQuery,
  ): Promise<GetBudgetOverviewResponse> {
    const period = _formatPeriod(query.month);

    const [budgets, rollups] = await Promise.all([
      this.budgetRepository.findByUserId(query.userId),
      this.rollupRepository.findByUserAndPeriod(query.userId, period),
    ]);

    const spendingMap = new Map(
      rollups.map((r) => [r.category, r.totalCents / 100]),
    );

    const overview = await Promise.all(
      budgets.map(async (budget) => {
        const transactions =
          await this.transactionRepository.findByUserIdAndCategory(
            budget.userId,
            budget.category,
            10,
          );

        return {
          id: budget.id,
          category: budget.category,
          monthlyLimit: budget.monthlyLimit,
          spent: spendingMap.get(budget.category) ?? 0,
          transactions: TransactionMapper.toDTOList(transactions),
        };
      }),
    );

    return Result.ok(overview);
  }
}

export { GetBudgetOverviewHandler };
