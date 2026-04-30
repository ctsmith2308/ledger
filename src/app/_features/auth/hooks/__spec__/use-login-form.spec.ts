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

const mockLoginAction = vi.fn();

vi.mock('@/app/_entities/identity/actions', () => ({
  loginAction: (...args: unknown[]) => mockLoginAction(...args),
}));

import { useLoginForm, DEMO_USERS } from '../use-login-form.hook';

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('exposes form, formId, isPending, and demo users', () => {
    const { result } = renderHookWithProviders(() => useLoginForm());

    expect(result.current.formId).toBe('login-form');
    expect(result.current.isPending).toBe(false);
    expect(result.current.form).toBeDefined();
    expect(result.current.demoUsers).toBe(DEMO_USERS);
    expect(result.current.selectedUser).toBeNull();
  });

  it('navigates to overview on successful login without MFA', async () => {
    mockLoginAction.mockResolvedValue(undefined);

    const { result } = renderHookWithProviders(() => useLoginForm());

    await act(() => {
      result.current.form.setFieldValue('email', 'chris@ledger.app');
      result.current.form.setFieldValue('password', 'Password@123!');
    });

    await act(() => result.current.form.handleSubmit());

    expect(mockLoginAction).toHaveBeenCalledWith({
      email: 'chris@ledger.app',
      password: 'Password@123!',
    });
    expect(mockPush).toHaveBeenCalledWith('/overview');
  });

  it('stores challenge token and navigates to MFA on MFA-required response', async () => {
    mockLoginAction.mockResolvedValue({
      challengeToken: 'mfa-token-xyz',
    });

    const { result } = renderHookWithProviders(() => useLoginForm());

    await act(() => {
      result.current.form.setFieldValue('email', 'chris@ledger.app');
      result.current.form.setFieldValue('password', 'Password@123!');
    });

    await act(() => result.current.form.handleSubmit());

    expect(sessionStorage.getItem('mfa_challenge')).toBe('mfa-token-xyz');
    expect(mockPush).toHaveBeenCalledWith('/mfa');
  });

  it('populates form fields when selecting a demo user', () => {
    const { result } = renderHookWithProviders(() => useLoginForm());

    act(() => {
      result.current.selectUser(DEMO_USERS[0]);
    });

    expect(result.current.selectedUser).toBe(DEMO_USERS[0]);
    expect(result.current.form.getFieldValue('email')).toBe(
      DEMO_USERS[0].email,
    );
    expect(result.current.form.getFieldValue('password')).toBe(
      DEMO_USERS[0].password,
    );
  });
});
