// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { act } from '@testing-library/react';

import { renderHookWithProviders } from '@/tests/common/render-hook';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn((action: unknown) => action),
}));

const mockCreateLinkTokenAction = vi.fn();
const mockExchangePublicTokenAction = vi.fn();
const mockSyncTransactionsAction = vi.fn();

vi.mock('@/app/_entities/banking/actions', () => ({
  createLinkTokenAction: (...args: unknown[]) =>
    mockCreateLinkTokenAction(...args),
  exchangePublicTokenAction: (...args: unknown[]) =>
    mockExchangePublicTokenAction(...args),
}));

vi.mock('@/app/_entities/transactions/actions', () => ({
  syncTransactionsAction: (...args: unknown[]) =>
    mockSyncTransactionsAction(...args),
}));

const mockOpen = vi.fn();
let mockReady = false;
let capturedOnSuccess: ((publicToken: string) => void) | null = null;

vi.mock('react-plaid-link', () => ({
  usePlaidLink: (config: {
    token: string | null;
    onSuccess: (publicToken: string) => void;
  }) => {
    capturedOnSuccess = config.onSuccess;
    return { open: mockOpen, ready: mockReady };
  },
}));

import { usePlaidLinkFlow } from '../use-plaid-link-flow.hook';

describe('usePlaidLinkFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReady = false;
    capturedOnSuccess = null;
  });

  it('exposes connect, isPending, and isReady', () => {
    const { result } = renderHookWithProviders(() => usePlaidLinkFlow());

    expect(result.current.connect).toBeTypeOf('function');
    expect(result.current.isPending).toBe(false);
    expect(result.current.isReady).toBe(false);
  });

  it('creates a link token on connect', async () => {
    mockCreateLinkTokenAction.mockResolvedValue({
      linkToken: 'link-token-xyz',
    });

    const { result } = renderHookWithProviders(() => usePlaidLinkFlow());

    await act(() => {
      result.current.connect();
    });

    expect(mockCreateLinkTokenAction).toHaveBeenCalled();
  });

  it('exchanges public token and syncs transactions on plaid success', async () => {
    mockCreateLinkTokenAction.mockResolvedValue({
      linkToken: 'link-token-xyz',
    });
    mockExchangePublicTokenAction.mockResolvedValue(undefined);
    mockSyncTransactionsAction.mockResolvedValue(undefined);

    const { result, queryClient } = renderHookWithProviders(() =>
      usePlaidLinkFlow(),
    );

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await act(() => {
      result.current.connect();
    });

    await act(() => {
      if (capturedOnSuccess) capturedOnSuccess('public-token-abc');
    });

    expect(mockExchangePublicTokenAction).toHaveBeenCalledWith({
      publicToken: 'public-token-abc',
    });
    expect(mockSyncTransactionsAction).toHaveBeenCalled();
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.accounts,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.transactions,
    });
  });
});
