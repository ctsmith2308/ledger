import { Query, DomainException, Result } from '@/core/shared/domain';
import { User } from '../../../domain/aggregates';

type GetUserProfileResponse = Result<User, DomainException>;

class GetUserProfileQuery extends Query<GetUserProfileResponse> {
  constructor(readonly jwt: string) {
    super();
  }
}

export { GetUserProfileQuery };
export type { GetUserProfileResponse };
