import { IHandler, Result } from '@/core/shared/domain';

import { type ICategoryRollupRepository } from '@/core/modules/transactions/domain';

import {
  GetSpendingPeriodsQuery,
  GetSpendingPeriodsResponse,
} from './get-spending-periods.query';

class GetSpendingPeriodsHandler
  implements IHandler<GetSpendingPeriodsQuery, GetSpendingPeriodsResponse>
{
  constructor(
    private readonly rollupRepository: ICategoryRollupRepository,
  ) {}

  async execute(
    query: GetSpendingPeriodsQuery,
  ): Promise<GetSpendingPeriodsResponse> {
    const periods = await this.rollupRepository.findDistinctPeriodsByUser(
      query.userId,
    );

    return Result.ok(periods);
  }
}

export { GetSpendingPeriodsHandler };
