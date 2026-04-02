import { Query, DomainException, Result } from '@/core/shared/domain';

type SpendingByCategory = {
  category: string;
  total: number;
};

type GetSpendingByCategoryResponse = Result<
  SpendingByCategory[],
  DomainException
>;

class GetSpendingByCategoryQuery extends Query<GetSpendingByCategoryResponse> {
  static readonly type = 'GetSpendingByCategoryQuery';

  constructor(
    readonly userId: string,
    readonly month: Date,
  ) {
    super();
  }
}

export {
  GetSpendingByCategoryQuery,
  type GetSpendingByCategoryResponse,
  type SpendingByCategory,
};
