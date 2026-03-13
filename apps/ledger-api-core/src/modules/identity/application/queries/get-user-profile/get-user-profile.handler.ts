import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  GetUserProfileQuery,
  type GetUserProfileResponse,
} from './get-user-profile.query';
import { Result } from '@/shared/domain';

import {
  IUserRepository,
  USER_REPOSITORY,
  UserId,
  UserNotFoundError,
} from '@/modules/identity/domain';

@QueryHandler(GetUserProfileQuery)
class GetUserProfileHandler implements IQueryHandler<GetUserProfileQuery> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: GetUserProfileQuery): Promise<GetUserProfileResponse> {
    const userIdResult = UserId.create(query.id);
    if (userIdResult.isFailure) return Result.fail(userIdResult.error);
    const userId = userIdResult.value;

    const user = await this.userRepository.findById(userId);

    return user ? Result.ok(user) : Result.fail(new UserNotFoundError());
  }
}

export { GetUserProfileHandler };
