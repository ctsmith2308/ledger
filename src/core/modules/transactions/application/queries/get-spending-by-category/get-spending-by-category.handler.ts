import { IHandler, Result } from '@/core/shared/domain';
import { ITransactionRepository } from '@/core/modules/transactions/domain';

import {
  GetSpendingByCategoryQuery,
  GetSpendingByCategoryResponse,
  SpendingByCategory,
} from './get-spending-by-category.query';

class GetSpendingByCategoryHandler
  implements
    IHandler<GetSpendingByCategoryQuery, GetSpendingByCategoryResponse>
{
  constructor(
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(
    query: GetSpendingByCategoryQuery,
  ): Promise<GetSpendingByCategoryResponse> {
    const transactions = await this.transactionRepository.findByUserId(
      query.userId,
    );

    const monthStart = new Date(
      query.month.getFullYear(),
      query.month.getMonth(),
      1,
    );
    const monthEnd = new Date(
      query.month.getFullYear(),
      query.month.getMonth() + 1,
      1,
    );

    const filtered = transactions.filter((t) => {
      const date = t.date;
      return date >= monthStart && date < monthEnd;
    });

    const categoryMap = new Map<string, number>();

    for (const transaction of filtered) {
      const category = transaction.category ?? 'Uncategorized';
      const current = categoryMap.get(category) ?? 0;
      categoryMap.set(category, current + transaction.amount);
    }

    const grouped: SpendingByCategory[] = [];

    for (const [category, total] of categoryMap) {
      grouped.push({ category, total });
    }

    return Result.ok(grouped);
  }
}

export { GetSpendingByCategoryHandler };
