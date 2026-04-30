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
  logoutAction: vi.fn().mockResolvedValue(undefined),
}));

import { useLogout } from '../use-logout.hook';

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes logout function and isPending', () => {
    const { result } = renderHookWithProviders(() => useLogout());

    expect(result.current.logout).toBeTypeOf('function');
    expect(result.current.isPending).toBe(false);
  });

  it('navigates to login on success', async () => {
    const { result } = renderHookWithProviders(() => useLogout());

    await act(() => {
      result.current.logout();
    });

    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});
