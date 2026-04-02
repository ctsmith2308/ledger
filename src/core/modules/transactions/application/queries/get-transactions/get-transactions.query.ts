import { Query, DomainException, Result } from '@/core/shared/domain';

import { Transaction } from '@/core/modules/transactions/domain';

type GetTransactionsResponse = Result<Transaction[], DomainException>;

class GetTransactionsQuery extends Query<GetTransactionsResponse> {
  static readonly type = 'GetTransactionsQuery';

  constructor(readonly userId: string) {
    super();
  }
}

export { GetTransactionsQuery, type GetTransactionsResponse };
