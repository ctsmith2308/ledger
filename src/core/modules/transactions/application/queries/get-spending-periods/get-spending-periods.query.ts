import { Query, DomainException, Result } from '@/core/shared/domain';

type GetSpendingPeriodsResponse = Result<string[], DomainException>;

class GetSpendingPeriodsQuery extends Query<GetSpendingPeriodsResponse> {
  static readonly type = 'GetSpendingPeriodsQuery';

  constructor(readonly userId: string) {
    super();
  }
}

export { GetSpendingPeriodsQuery, type GetSpendingPeriodsResponse };
