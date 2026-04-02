interface IFeatureFlagCache {
  getFeatures(userId: string): Promise<string[] | null>;
  setFeatures(userId: string, features: string[]): Promise<void>;
  invalidate(userId: string): Promise<void>;
}

export { type IFeatureFlagCache };
