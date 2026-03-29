import { createMiddleware } from 'next-safe-action';

import { DemoRestrictedException } from '@/core/shared/domain';
import { StaticFeatureFlagService } from '@/core/shared/infrastructure';

const withFeatureFlag = createMiddleware().define(async ({ next, ctx }) => {
  const { userId, tier } = ctx as { userId: string; tier: string };

  const enabled = StaticFeatureFlagService.isEnabled('default', {
    userId,
    tier,
  });

  if (!enabled) throw new DemoRestrictedException();

  return next();
});

export { withFeatureFlag };
