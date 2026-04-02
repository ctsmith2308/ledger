import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetQueryData = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    getQueryData: mockGetQueryData,
  }),
}));

vi.mock('@/app/_shared/lib/query/query-keys', () => ({
  queryKeys: { featureFlags: ['feature-flags'] },
}));

import { useFeatureFlags } from '../use-feature-flags.hook';

describe('useFeatureFlags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns isEnabled and isDisabled functions', () => {
    mockGetQueryData.mockReturnValue(undefined);

    const result = useFeatureFlags();

    expect(result.isEnabled).toBeDefined();
    expect(result.isDisabled).toBeDefined();
  });

  it('isEnabled returns true for present flags', () => {
    mockGetQueryData.mockReturnValue(['mfa', 'plaid']);

    const { isEnabled } = useFeatureFlags();

    expect(isEnabled('mfa')).toBe(true);
    expect(isEnabled('plaid')).toBe(true);
  });

  it('isEnabled returns false for absent flags', () => {
    mockGetQueryData.mockReturnValue(['mfa']);

    const { isEnabled } = useFeatureFlags();

    expect(isEnabled('plaid')).toBe(false);
  });

  it('isDisabled returns true for absent flags', () => {
    mockGetQueryData.mockReturnValue(['mfa']);

    const { isDisabled } = useFeatureFlags();

    expect(isDisabled('plaid')).toBe(true);
  });

  it('isDisabled returns false for present flags', () => {
    mockGetQueryData.mockReturnValue(['mfa']);

    const { isDisabled } = useFeatureFlags();

    expect(isDisabled('mfa')).toBe(false);
  });

  it('defaults to empty set when cache is empty', () => {
    mockGetQueryData.mockReturnValue(undefined);

    const { isEnabled, isDisabled } = useFeatureFlags();

    expect(isEnabled('anything')).toBe(false);
    expect(isDisabled('anything')).toBe(true);
  });

  it('reads from the feature-flags query key', () => {
    mockGetQueryData.mockReturnValue(undefined);

    useFeatureFlags();

    expect(mockGetQueryData).toHaveBeenCalledWith(['feature-flags']);
  });
});
