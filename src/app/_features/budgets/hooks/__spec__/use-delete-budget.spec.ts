// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { act } from '@testing-library/react';

import { renderHookWithProviders } from '@/tests/common/render-hook';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn((action: unknown) => action),
}));

const mockDeleteBudgetAction = vi.fn();

vi.mock('@/app/_entities/budgets/actions', () => ({
  deleteBudgetAction: (...args: unknown[]) => mockDeleteBudgetAction(...args),
}));

import { useDeleteBudget } from '../use-delete-budget.hook';

describe('useDeleteBudget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes deleteBudget function and isDeleting', () => {
    const { result } = renderHookWithProviders(() => useDeleteBudget());

    expect(result.current.deleteBudget).toBeTypeOf('function');
    expect(result.current.isDeleting).toBe(false);
  });

  it('calls the action and invalidates budget overview cache on success', async () => {
    mockDeleteBudgetAction.mockResolvedValue(undefined);

    const { result, queryClient } = renderHookWithProviders(() =>
      useDeleteBudget(),
    );

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await act(() => {
      result.current.deleteBudget('budget-123');
    });

    expect(mockDeleteBudgetAction).toHaveBeenCalledWith({
      budgetId: 'budget-123',
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.budgetOverview,
    });
  });
});
