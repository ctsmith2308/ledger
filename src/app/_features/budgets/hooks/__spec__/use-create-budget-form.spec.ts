// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { act } from '@testing-library/react';

import { renderHookWithProviders } from '@/tests/common/render-hook';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn((action: unknown) => action),
}));

const mockCreateBudgetAction = vi.fn();

vi.mock('@/app/_entities/budgets/actions', () => ({
  createBudgetAction: (...args: unknown[]) =>
    mockCreateBudgetAction(...args),
}));

import { useCreateBudgetForm } from '../use-create-budget-form.hook';

describe('useCreateBudgetForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes form, formId, and isPending', () => {
    const { result } = renderHookWithProviders(() => useCreateBudgetForm());

    expect(result.current.formId).toBe('create-budget-form');
    expect(result.current.isPending).toBe(false);
    expect(result.current.form).toBeDefined();
  });

  it('calls the action with parsed input on submit', async () => {
    mockCreateBudgetAction.mockResolvedValue(undefined);

    const { result } = renderHookWithProviders(() => useCreateBudgetForm());

    await act(() => {
      result.current.form.setFieldValue('category', 'FOOD_AND_DRINK');
      result.current.form.setFieldValue('monthlyLimit', '500');
    });

    await act(() => result.current.form.handleSubmit());

    expect(mockCreateBudgetAction).toHaveBeenCalledWith({
      category: 'FOOD_AND_DRINK',
      monthlyLimit: 500,
    });
  });

  it('invalidates budget overview cache on success', async () => {
    mockCreateBudgetAction.mockResolvedValue(undefined);

    const { result, queryClient } = renderHookWithProviders(() =>
      useCreateBudgetForm(),
    );

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await act(() => {
      result.current.form.setFieldValue('category', 'FOOD_AND_DRINK');
      result.current.form.setFieldValue('monthlyLimit', '500');
    });

    await act(() => result.current.form.handleSubmit());

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.budgetOverview,
    });
  });

  it('calls the onSuccess callback when provided', async () => {
    mockCreateBudgetAction.mockResolvedValue(undefined);
    const onSuccess = vi.fn();

    const { result } = renderHookWithProviders(() =>
      useCreateBudgetForm(onSuccess),
    );

    await act(() => {
      result.current.form.setFieldValue('category', 'FOOD_AND_DRINK');
      result.current.form.setFieldValue('monthlyLimit', '500');
    });

    await act(() => result.current.form.handleSubmit());

    expect(onSuccess).toHaveBeenCalled();
  });
});
