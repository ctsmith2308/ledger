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

vi.mock('@/app/_entities/identity/actions', () => ({
  deleteAccountAction: vi.fn().mockResolvedValue(undefined),
}));

import { useDeleteAccount } from '../use-delete-account.hook';

describe('useDeleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes deleteAccount function and isDeleting', () => {
    const { result } = renderHookWithProviders(() => useDeleteAccount());

    expect(result.current.deleteAccount).toBeTypeOf('function');
    expect(result.current.isDeleting).toBe(false);
  });

  it('navigates to login on success', async () => {
    const { result } = renderHookWithProviders(() => useDeleteAccount());

    await act(() => {
      result.current.deleteAccount();
    });

    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
