import { Query, DomainException, Result } from '@/core/shared/domain';
import { User } from '@/core/modules/identity/domain';

type GetUserAccountResponse = Result<User, DomainException>;

class GetUserAccountQuery extends Query<GetUserAccountResponse> {
  constructor(readonly userId: string) {
    super();
  }
}

export { GetUserAccountQuery };
export type { GetUserAccountResponse };
