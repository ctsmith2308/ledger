import { Query, DomainException, Result } from '@/core/shared/domain';

import { User, UserProfile } from '@/core/modules/identity/domain';

type GetUserAccountData = {
  user: User;
  profile: UserProfile;
  features: string[];
};

type GetUserAccountResponse = Result<GetUserAccountData, DomainException>;

class GetUserAccountQuery extends Query<GetUserAccountResponse> {
  static readonly type = 'GetUserAccountQuery';

  constructor(readonly userId: string) {
    super();
  }
}

export { GetUserAccountQuery };
export type { GetUserAccountData, GetUserAccountResponse };
