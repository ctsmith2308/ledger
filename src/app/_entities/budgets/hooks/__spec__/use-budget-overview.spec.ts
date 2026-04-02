import { describe, it, expect, vi, beforeEach } from 'vitest';

let mockQueryFn: (() => Promise<unknown>) | null = null;
let mockQueryKey: string[] | null = null;

vi.mock('@tanstack/react-query', () => ({
  useQuery: (opts: {
    queryKey: string[];
    queryFn: () => Promise<unknown>;
  }) => {
    mockQueryFn = opts.queryFn;
    mockQueryKey = opts.queryKey;
    return {
      data: undefined,
      isLoading: false,
      error: null,
    };
  },
}));

vi.mock('@/app/_shared/lib/query/query-keys', () => ({
  queryKeys: { budgetOverview: ['budget-overview'] },
}));

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  ActionError: class ActionError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
}));

vi.mock('@/core/modules/budgets', () => ({}));

import { useBudgetOverview } from '../use-budget-overview.hook';

describe('useBudgetOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryFn = null;
    mockQueryKey = null;
  });

  it('returns query result', () => {
    const result = useBudgetOverview();

    expect(result).toBeDefined();
    expect(result.data).toBeUndefined();
    expect(result.isLoading).toBe(false);
  });

  it('uses the budget-overview query key', () => {
    useBudgetOverview();

    expect(mockQueryKey).toEqual(['budget-overview']);
  });

  it('queryFn fetches from /api/budgets/overview', async () => {
    const mockData = [{ id: '1', category: 'Food', monthlyLimit: 500 }];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    useBudgetOverview();

    if (mockQueryFn) {
      const data = await mockQueryFn();
      expect(data).toEqual(mockData);
    }

    expect(global.fetch).toHaveBeenCalledWith('/api/budgets/overview');
  });

  it('queryFn throws ActionError on non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({ code: 'NOT_FOUND', message: 'Not found' }),
    });

    useBudgetOverview();

    if (mockQueryFn) {
      await expect(mockQueryFn()).rejects.toThrow('Not found');
    }
  });
});
