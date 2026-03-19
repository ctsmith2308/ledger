import { IHandler } from '@/core/shared/domain';
import { User } from '../../domain/aggregates';

import { IUserRepository } from '../../domain/repositories';

import {
  GetUserProfileQuery,
  GetUserProfileResponse,
} from './get-user-profile.query';

class GetUserProfileHandler implements IHandler<
  GetUserProfileQuery,
  GetUserProfileResponse
> {
  async execute(query: GetUserProfileQuery): Promise<GetUserProfileResponse> {
    console.log({ query });
    return new Promise((res) => {
      setTimeout(() => {
        // const user = res(Result.ok(user));
      }, 3000);
    });
    // const userIdResult = UserId.create(query.jwtToken);
    // // extract userId from jwt token;
    // if (userIdResult.isFailure) return Result.fail(userIdResult.error);
    // const userId = userIdResult.value;

    // const user = await this.userRepository.findById(userId);

    // return user ? Result.ok(user) : Result.fail(new UserNotFoundError());
  }
}

export { GetUserProfileHandler };
