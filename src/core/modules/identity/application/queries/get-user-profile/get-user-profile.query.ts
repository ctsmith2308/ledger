import { Query, DomainException, Result } from '@/core/shared/domain';
import { UserProfile } from '../../../domain/aggregates';

type GetUserProfileResponse = Result<UserProfile, DomainException>;

class GetUserProfileQuery extends Query<GetUserProfileResponse> {
  constructor(readonly userId: string) {
    super();
  }
}

export { GetUserProfileQuery };
export type { GetUserProfileResponse };
