import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetQueryData = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    getQueryData: mockGetQueryData,
  }),
}));

import { useUserTier } from '../use-user-tier.hook';

describe('useUserTier', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null tier and false isDemo when no session', () => {
    mockGetQueryData.mockReturnValue(undefined);

    const result = useUserTier();

    expect(result.tier).toBeNull();
    expect(result.isDemo).toBe(false);
  });

  it('returns TRIAL tier and false isDemo for trial users', () => {
    mockGetQueryData.mockReturnValue({
      userId: 'user-1',
      email: 'test@example.com',
      tier: 'TRIAL',
    });

    const result = useUserTier();

    expect(result.tier).toBe('TRIAL');
    expect(result.isDemo).toBe(false);
  });

  it('returns DEMO tier and true isDemo for demo users', () => {
    mockGetQueryData.mockReturnValue({
      userId: 'user-1',
      email: 'demo@ledger.app',
      tier: 'DEMO',
    });

    const result = useUserTier();

    expect(result.tier).toBe('DEMO');
    expect(result.isDemo).toBe(true);
  });

  it('returns FULL tier and false isDemo for full users', () => {
    mockGetQueryData.mockReturnValue({
      userId: 'user-1',
      email: 'user@example.com',
      tier: 'FULL',
    });

    const result = useUserTier();

    expect(result.tier).toBe('FULL');
    expect(result.isDemo).toBe(false);
  });
});
