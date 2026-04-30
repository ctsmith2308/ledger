// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { act } from '@testing-library/react';

import { renderHookWithProviders } from '@/tests/common/render-hook';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn((action: unknown) => action),
}));

const mockSetupMfaAction = vi.fn();
const mockVerifyMfaSetupAction = vi.fn();
const mockDisableMfaAction = vi.fn();

vi.mock('@/app/_entities/identity/actions', () => ({
  setupMfaAction: (...args: unknown[]) => mockSetupMfaAction(...args),
  verifyMfaSetupAction: (...args: unknown[]) =>
    mockVerifyMfaSetupAction(...args),
  disableMfaAction: (...args: unknown[]) => mockDisableMfaAction(...args),
}));

import { useConfigureMfa, MFA_PROGRESS } from '../use-configure-mfa.hook';

describe('useConfigureMfa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts in idle state with no QR code', () => {
    const { result } = renderHookWithProviders(() => useConfigureMfa());

    expect(result.current.mfaProgress).toBe(MFA_PROGRESS.IDLE);
    expect(result.current.qrCodeDataUrl).toBeNull();
    expect(result.current.formId).toBe('mfa-setup-form');
    expect(result.current.isEnabling).toBe(false);
    expect(result.current.isVerifying).toBe(false);
    expect(result.current.isDisabling).toBe(false);
  });

  it('transitions to showing_qr with QR data on setup success', async () => {
    mockSetupMfaAction.mockResolvedValue({
      qrCodeDataUrl: 'data:image/png;base64,abc',
    });

    const { result } = renderHookWithProviders(() => useConfigureMfa());

    await act(() => {
      result.current.enableMfa();
    });

    expect(result.current.mfaProgress).toBe(MFA_PROGRESS.SHOWING_QR);
    expect(result.current.qrCodeDataUrl).toBe('data:image/png;base64,abc');
  });

  it('transitions to success on verify', async () => {
    mockSetupMfaAction.mockResolvedValue({
      qrCodeDataUrl: 'data:image/png;base64,abc',
    });
    mockVerifyMfaSetupAction.mockResolvedValue(undefined);

    const { result } = renderHookWithProviders(() => useConfigureMfa());

    await act(() => {
      result.current.enableMfa();
    });

    await act(() => {
      result.current.form.setFieldValue('totpCode', '123456');
    });

    await act(() => result.current.form.handleSubmit());

    expect(mockVerifyMfaSetupAction).toHaveBeenCalledWith({
      totpCode: '123456',
    });
    expect(result.current.mfaProgress).toBe(MFA_PROGRESS.SUCCESS);
  });

  it('invalidates user account cache on disable', async () => {
    mockDisableMfaAction.mockResolvedValue(undefined);

    const { result, queryClient } = renderHookWithProviders(() =>
      useConfigureMfa(),
    );

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await act(() => {
      result.current.disableMfa();
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.userAccount,
    });
  });

  it('reset returns to idle state and clears QR data', async () => {
    mockSetupMfaAction.mockResolvedValue({
      qrCodeDataUrl: 'data:image/png;base64,abc',
    });

    const { result } = renderHookWithProviders(() => useConfigureMfa());

    await act(() => {
      result.current.enableMfa();
    });

    expect(result.current.mfaProgress).toBe(MFA_PROGRESS.SHOWING_QR);

    act(() => {
      result.current.reset();
    });

    expect(result.current.mfaProgress).toBe(MFA_PROGRESS.IDLE);
    expect(result.current.qrCodeDataUrl).toBeNull();
  });
});
