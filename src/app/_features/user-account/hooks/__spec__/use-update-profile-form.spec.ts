// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { act } from '@testing-library/react';

import { renderHookWithProviders } from '@/tests/common/render-hook';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

const mockRefresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: mockRefresh }),
}));

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn((action: unknown) => action),
}));

const mockUpdateUserProfileAction = vi.fn();

vi.mock('@/app/_entities/identity/actions', () => ({
  updateUserProfileAction: (...args: unknown[]) =>
    mockUpdateUserProfileAction(...args),
}));

import { useUpdateProfileForm } from '../use-update-profile-form.hook';

const initial = { firstName: 'John', lastName: 'Doe' };

describe('useUpdateProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes form, formId, isPending, and onConfirm', () => {
    const { result } = renderHookWithProviders(() =>
      useUpdateProfileForm(initial),
    );

    expect(result.current.formId).toBe('update-profile-form');
    expect(result.current.isPending).toBe(false);
    expect(result.current.form).toBeDefined();
    expect(result.current.onConfirm).toBeTypeOf('function');
  });

  it('initialises form with provided values', () => {
    const { result } = renderHookWithProviders(() =>
      useUpdateProfileForm(initial),
    );

    expect(result.current.form.getFieldValue('firstName')).toBe('John');
    expect(result.current.form.getFieldValue('lastName')).toBe('Doe');
  });

  it('stores pending values on submit and mutates on confirm', async () => {
    mockUpdateUserProfileAction.mockResolvedValue(undefined);

    const { result, queryClient } = renderHookWithProviders(() =>
      useUpdateProfileForm(initial),
    );

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await act(() => {
      result.current.form.setFieldValue('firstName', 'Jane');
      result.current.form.setFieldValue('lastName', 'Smith');
    });

    await act(() => result.current.form.handleSubmit());

    expect(mockUpdateUserProfileAction).not.toHaveBeenCalled();

    await act(() => {
      result.current.onConfirm();
    });

    expect(mockUpdateUserProfileAction).toHaveBeenCalledWith({
      firstName: 'Jane',
      lastName: 'Smith',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.userAccount,
    });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('onConfirm does nothing when no pending values', () => {
    const { result } = renderHookWithProviders(() =>
      useUpdateProfileForm(initial),
    );

    act(() => {
      result.current.onConfirm();
    });

    expect(mockUpdateUserProfileAction).not.toHaveBeenCalled();
  });
});
