import {
  IHandler,
  IFeatureFlagRepository,
  IFeatureFlagCache,
  FeatureFlagCacheException,
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
    private readonly featureFlagCache: IFeatureFlagCache,
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

    let features: string[] | null = null;

    try {
      features = await this.featureFlagCache.getFeatures(userId.value);
    } catch (error) {
      if (!(error instanceof FeatureFlagCacheException)) throw error;
    }

    if (!features) {
      features = await this.featureFlagRepo.findEnabledByTier(user.tier.value);

      try {
        await this.featureFlagCache.setFeatures(userId.value, features);
      } catch (error) {
        if (!(error instanceof FeatureFlagCacheException)) throw error;
      }
    }

    return Result.ok({ user, profile, features });
  }
}

export { GetUserAccountHandler };
