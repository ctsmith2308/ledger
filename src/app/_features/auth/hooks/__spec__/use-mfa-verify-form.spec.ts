// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { act } from '@testing-library/react';

import { renderHookWithProviders } from '@/tests/common/render-hook';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, refresh: vi.fn() }),
}));

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn((action: unknown) => action),
}));

const mockVerifyMfaLoginAction = vi.fn();

vi.mock('@/app/_entities/identity/actions', () => ({
  verifyMfaLoginAction: (...args: unknown[]) =>
    mockVerifyMfaLoginAction(...args),
}));

import { useMfaVerifyForm } from '../use-mfa-verify-form.hook';

describe('useMfaVerifyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('exposes form, formId, and isPending', () => {
    const { result } = renderHookWithProviders(() => useMfaVerifyForm());

    expect(result.current.formId).toBe('mfa-verify-form');
    expect(result.current.isPending).toBe(false);
    expect(result.current.form).toBeDefined();
  });

  it('redirects to login when no challenge token exists', async () => {
    const { result } = renderHookWithProviders(() => useMfaVerifyForm());

    await act(() => {
      result.current.form.setFieldValue('totpCode', '123456');
    });

    await act(() => result.current.form.handleSubmit());

    expect(mockReplace).toHaveBeenCalledWith('/login');
    expect(mockVerifyMfaLoginAction).not.toHaveBeenCalled();
  });

  it('calls the action with challenge token and clears storage on success', async () => {
    sessionStorage.setItem('mfa_challenge', 'test-token');
    mockVerifyMfaLoginAction.mockResolvedValue(undefined);

    const { result } = renderHookWithProviders(() => useMfaVerifyForm());

    await act(() => {
      result.current.form.setFieldValue('totpCode', '123456');
    });

    await act(() => result.current.form.handleSubmit());

    expect(mockVerifyMfaLoginAction).toHaveBeenCalledWith({
      challengeToken: 'test-token',
      totpCode: '123456',
    });
    expect(sessionStorage.getItem('mfa_challenge')).toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/overview');
  });
});
