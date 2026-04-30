// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { act } from '@testing-library/react';

import { renderHookWithProviders } from '@/tests/common/render-hook';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn((action: unknown) => action),
}));

const mockUpdateBudgetAction = vi.fn();

vi.mock('@/app/_entities/budgets/actions/update-budget.action', () => ({
  updateBudgetAction: (...args: unknown[]) => mockUpdateBudgetAction(...args),
}));

import { useUpdateBudget } from '../use-update-budget.hook';

describe('useUpdateBudget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes updateBudget function and isUpdating', () => {
    const { result } = renderHookWithProviders(() => useUpdateBudget());

    expect(result.current.updateBudget).toBeTypeOf('function');
    expect(result.current.isUpdating).toBe(false);
  });

  it('calls the action and invalidates budget overview cache on success', async () => {
    mockUpdateBudgetAction.mockResolvedValue(undefined);

    const { result, queryClient } = renderHookWithProviders(() =>
      useUpdateBudget(),
    );

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await act(() => {
      result.current.updateBudget({ budgetId: 'b-1', monthlyLimit: 500 });
    });

    expect(mockUpdateBudgetAction).toHaveBeenCalledWith({
      budgetId: 'b-1',
      monthlyLimit: 500,
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.budgetOverview,
    });
  });
});
