import { describe, it, expect } from 'vitest';
import { UserTier, USER_TIERS } from '../user-tier.value-object';

describe('UserTier', () => {
  describe('create', () => {
    it('succeeds for DEMO', () => {
      const result = UserTier.create('DEMO');
      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe(USER_TIERS.DEMO);
    });

    it('succeeds for TRIAL', () => {
      const result = UserTier.create('TRIAL');
      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe(USER_TIERS.TRIAL);
    });

    it('succeeds for FULL', () => {
      const result = UserTier.create('FULL');
      expect(result.isSuccess).toBe(true);
      expect(result.value.value).toBe(USER_TIERS.FULL);
    });

    it('fails for invalid tier', () => {
      const result = UserTier.create('INVALID');
      expect(result.isFailure).toBe(true);
    });

    it('fails for empty string', () => {
      const result = UserTier.create('');
      expect(result.isFailure).toBe(true);
    });
  });

  describe('from', () => {
    it('reconstitutes without validation', () => {
      const tier = UserTier.from('DEMO');
      expect(tier.value).toBe(USER_TIERS.DEMO);
    });
  });

  describe('helpers', () => {
    it('isDemo returns true for DEMO tier', () => {
      const tier = UserTier.from('DEMO');
      expect(tier.isDemo).toBe(true);
      expect(tier.isTrial).toBe(false);
    });

    it('isTrial returns true for TRIAL tier', () => {
      const tier = UserTier.from('TRIAL');
      expect(tier.isTrial).toBe(true);
      expect(tier.isDemo).toBe(false);
    });
  });

  describe('equality', () => {
    it('two tiers with same value are equal', () => {
      const a = UserTier.from('TRIAL');
      const b = UserTier.from('TRIAL');
      expect(a.equals(b)).toBe(true);
    });

    it('two tiers with different values are not equal', () => {
      const a = UserTier.from('DEMO');
      const b = UserTier.from('TRIAL');
      expect(a.equals(b)).toBe(false);
    });
  });
});
