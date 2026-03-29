type FeatureFlagContext = {
  userId: string;
  tier: string;
};

interface IFeatureFlagService {
  isEnabled(flagKey: string, context: FeatureFlagContext): boolean;
}

export { type IFeatureFlagService, type FeatureFlagContext };
