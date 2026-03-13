import { Query } from '@nestjs/cqrs';
import { User } from '@/modules/identity/domain';
import { Result } from '@/shared/domain';

type GetUserProfileResponse = Result<User, Error>;

class GetUserProfileQuery extends Query<GetUserProfileResponse> {
  constructor(public readonly id: string) {
    super();
  }
}

export { GetUserProfileQuery, type GetUserProfileResponse };
