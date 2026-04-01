import { IHandler, Result, UserNotFoundException } from '@/core/shared/domain';

import {
  UserId,
  IUserProfileRepository,
} from '@/core/modules/identity/domain';

import {
  GetUserProfileQuery,
  GetUserProfileResponse,
} from './get-user-profile.query';

class GetUserProfileHandler
  implements IHandler<GetUserProfileQuery, GetUserProfileResponse>
{
  constructor(
    private readonly userProfileRepository: IUserProfileRepository,
  ) {}

  async execute(query: GetUserProfileQuery): Promise<GetUserProfileResponse> {
    const userIdResult = UserId.create(query.userId);
    if (userIdResult.isFailure) return Result.fail(new UserNotFoundException());
    const userId = userIdResult.value;

    const profile = await this.userProfileRepository.findById(userId);
    if (!profile) return Result.fail(new UserNotFoundException());

    return Result.ok(profile);
  }
}

export { GetUserProfileHandler };
