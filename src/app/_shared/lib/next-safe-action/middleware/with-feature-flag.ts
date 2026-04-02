import { createMiddleware } from 'next-safe-action';

import { FeatureDisabledException } from '@/core/shared/domain';

import {
  featureFlagCache,
  featureFlagRepo,
} from '@/core/shared/infrastructure';

import { identityService } from '@/core/modules/identity';

const withFeatureFlag = (feature: string) =>
  createMiddleware().define(async ({ ctx, next }) => {
    const { userId } = ctx as { userId: string };

    let features = await featureFlagCache.getFeatures(userId);

    if (!features) {
      const account = await identityService.getUserAccount(userId);
      features = await featureFlagRepo.findEnabledByTier(account.tier);
      await featureFlagCache.setFeatures(userId, features);
    }

    if (!features.includes(feature)) {
      throw new FeatureDisabledException();
    }

    return next();
  });

export { withFeatureFlag };
