import { Query, DomainException, Result } from '@/core/shared/domain';

import { Budget } from '@/core/modules/budgets/domain';

type GetBudgetsResponse = Result<Budget[], DomainException>;

class GetBudgetsQuery extends Query<GetBudgetsResponse> {
  constructor(readonly userId: string) {
    super();
  }
}

export { GetBudgetsQuery, type GetBudgetsResponse };
