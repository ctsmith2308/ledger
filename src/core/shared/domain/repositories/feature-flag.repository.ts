interface IFeatureFlagRepository {
  findEnabledByTier(tier: string): Promise<string[]>;
}

export { type IFeatureFlagRepository };
