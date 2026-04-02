import {
  IHandler,
  IFeatureFlagRepository,
  Result,
  UserNotFoundException,
} from '@/core/shared/domain';

import {
  UserId,
  IUserRepository,
  IUserProfileRepository,
} from '@/core/modules/identity/domain';

import {
  GetUserAccountQuery,
  GetUserAccountResponse,
} from './get-user-account.query';

class GetUserAccountHandler implements IHandler<
  GetUserAccountQuery,
  GetUserAccountResponse
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userProfileRepository: IUserProfileRepository,
    private readonly featureFlagRepo: IFeatureFlagRepository,
  ) {}

  async execute(query: GetUserAccountQuery): Promise<GetUserAccountResponse> {
    const userIdResult = UserId.create(query.userId);
    if (userIdResult.isFailure) return Result.fail(new UserNotFoundException());
    const userId = userIdResult.value;

    const [user, profile] = await Promise.all([
      this.userRepository.findById(userId),
      this.userProfileRepository.findById(userId),
    ]);

    if (!user || !profile) return Result.fail(new UserNotFoundException());

    const features = await this.featureFlagRepo.findEnabledByTier(
      user.tier.value,
    );

    return Result.ok({ user, profile, features });
  }
}

export { GetUserAccountHandler };
