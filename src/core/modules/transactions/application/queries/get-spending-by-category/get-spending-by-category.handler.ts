import { IHandler, Result } from '@/core/shared/domain';

import { type ICategoryRollupRepository } from '@/core/modules/transactions/domain';

import {
  GetSpendingByCategoryQuery,
  GetSpendingByCategoryResponse,
} from './get-spending-by-category.query';

const _formatPeriod = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

class GetSpendingByCategoryHandler implements IHandler<
  GetSpendingByCategoryQuery,
  GetSpendingByCategoryResponse
> {
  constructor(private readonly rollupRepository: ICategoryRollupRepository) {}

  async execute(
    query: GetSpendingByCategoryQuery,
  ): Promise<GetSpendingByCategoryResponse> {
    const period = _formatPeriod(query.month);

    const rollups = await this.rollupRepository.findByUserAndPeriod(
      query.userId,
      period,
    );

    const spending = rollups.map((r) => ({
      category: r.category,
      total: r.totalCents / 100,
    }));

    return Result.ok(spending);
  }
}

export { GetSpendingByCategoryHandler };
