// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { act } from '@testing-library/react';

import { renderHookWithProviders } from '@/tests/common/render-hook';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
}));

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn((action: unknown) => action),
}));

const mockRegisterAction = vi.fn();

vi.mock('@/app/_entities/identity/actions', () => ({
  registerAction: (...args: unknown[]) => mockRegisterAction(...args),
}));

import { useRegisterForm } from '../use-register-form.hook';

describe('useRegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes form, formId, and isPending', () => {
    const { result } = renderHookWithProviders(() => useRegisterForm());

    expect(result.current.formId).toBe('register-account-form');
    expect(result.current.isPending).toBe(false);
    expect(result.current.form).toBeDefined();
  });

  it('calls the action and navigates to login on success', async () => {
    mockRegisterAction.mockResolvedValue(undefined);

    const { result } = renderHookWithProviders(() => useRegisterForm());

    await act(() => {
      result.current.form.setFieldValue('firstName', 'Chris');
      result.current.form.setFieldValue('lastName', 'Smith');
      result.current.form.setFieldValue('email', 'chris@ledger.app');
      result.current.form.setFieldValue('password', 'Password@123!');
    });

    await act(() => result.current.form.handleSubmit());

    expect(mockRegisterAction).toHaveBeenCalledWith({
      firstName: 'Chris',
      lastName: 'Smith',
      email: 'chris@ledger.app',
      password: 'Password@123!',
    });
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
