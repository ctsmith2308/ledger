import { Query, DomainException, Result } from '@/core/shared/domain';
import { BankAccount } from '@/core/modules/banking/domain';

type GetAccountsResponse = Result<BankAccount[], DomainException>;

class GetAccountsQuery extends Query<GetAccountsResponse> {
  static readonly type = 'GetAccountsQuery';

  constructor(readonly userId: string) {
    super();
  }
}

export { GetAccountsQuery, type GetAccountsResponse };
