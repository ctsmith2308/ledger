import { IHandler } from '@/core/shared/domain';
import { GetUserProfileQuery, GetUserProfileResponse } from './get-user-profile.query';

class GetUserProfileHandler
  implements IHandler<GetUserProfileQuery, GetUserProfileResponse>
{
  async execute(query: GetUserProfileQuery): Promise<GetUserProfileResponse> {
    console.log({ query });
    return new Promise((_res) => {
      setTimeout(() => {
        // TODO: implement
        // const userIdResult = UserId.create(query.jwt);
        // if (userIdResult.isFailure) return Result.fail(userIdResult.error);
        // const userId = userIdResult.value;
        // const user = await this.userRepository.findById(userId);
        // return user ? Result.ok(user) : Result.fail(new UserNotFoundError());
      }, 3000);
    });
  }
}

export { GetUserProfileHandler };
