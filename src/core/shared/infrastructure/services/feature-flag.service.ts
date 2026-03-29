import {
  type IFeatureFlagService,
  type FeatureFlagContext,
} from '@/core/shared/domain';

const ALLOWED_TIERS = new Set(['TRIAL', 'FULL']);

const StaticFeatureFlagService: IFeatureFlagService = {
  isEnabled(_flagKey: string, context: FeatureFlagContext): boolean {
    return ALLOWED_TIERS.has(context.tier);
  },
};

export { StaticFeatureFlagService };
