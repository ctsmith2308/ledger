import { describe, it, expect } from 'vitest';

import { useUserTier } from '../use-user-tier.hook';

// TODO: Rewrite when feature_flags table replaces the tier stub
describe('useUserTier', () => {
  it('returns null tier and false isDemo (bridged until feature flags)', () => {
    const result = useUserTier();

    expect(result.tier).toBeNull();
    expect(result.isDemo).toBe(false);
  });
});
