import { Query, DomainException, Result } from '@/core/shared/domain';
import { UserProfile } from '@/core/modules/identity/domain';

type GetUserProfileResponse = Result<UserProfile, DomainException>;

class GetUserProfileQuery extends Query<GetUserProfileResponse> {
  constructor(readonly userId: string) {
    super();
  }
}

export { GetUserProfileQuery };
export type { GetUserProfileResponse };
