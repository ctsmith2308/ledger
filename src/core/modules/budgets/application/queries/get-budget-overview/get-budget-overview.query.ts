import { Query, DomainException, Result } from '@/core/shared/domain';

import { type TransactionDTO } from '@/core/modules/transactions';

type BudgetOverviewItem = {
  id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  transactions: TransactionDTO[];
};

type GetBudgetOverviewResponse = Result<
  BudgetOverviewItem[],
  DomainException
>;

class GetBudgetOverviewQuery extends Query<GetBudgetOverviewResponse> {
  static readonly type = 'GetBudgetOverviewQuery';

  constructor(
    readonly userId: string,
    readonly month: Date,
  ) {
    super();
  }
}

export {
  GetBudgetOverviewQuery,
  type GetBudgetOverviewResponse,
  type BudgetOverviewItem,
};
