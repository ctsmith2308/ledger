import { describe, it, expect, vi, beforeEach } from 'vitest';

let stateValue: string | null = null;
let effectCallback: (() => void) | null = null;
const mockOpen = vi.fn();
const mockMutate = vi.fn();
let mockReady = false;
let mockIsPending = false;
let onSuccessCallback: ((data: { linkToken: string }) => void) | null = null;

vi.mock('react', () => ({
  useState: (initial: unknown) => [stateValue ?? initial, (val: unknown) => { stateValue = val as string; }],
  useCallback: (fn: (...args: unknown[]) => unknown) => fn,
  useEffect: (fn: () => void) => { effectCallback = fn; },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useMutation: (opts: { mutationFn: (...args: unknown[]) => unknown; onSuccess?: (...args: unknown[]) => unknown }) => {
    onSuccessCallback = opts.onSuccess as typeof onSuccessCallback;
    return { mutate: mockMutate, isPending: mockIsPending };
  },
}));

vi.mock('react-plaid-link', () => ({
  usePlaidLink: () => ({
    open: mockOpen,
    ready: mockReady,
  }),
}));

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn((action: unknown) => action),
}));

vi.mock('@/app/_entities/banking/actions', () => ({
  createLinkTokenAction: vi.fn(),
  exchangePublicTokenAction: vi.fn(),
}));

vi.mock('@/app/_entities/banking/schema', () => ({}));

vi.mock('@/app/_entities/transactions/actions', () => ({
  syncTransactionsAction: vi.fn(),
}));

import { usePlaidLinkFlow } from '../use-plaid-link-flow.hook';

describe('usePlaidLinkFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stateValue = null;
    effectCallback = null;
    mockReady = false;
    mockIsPending = false;
  });

  it('returns initial state', () => {
    const result = usePlaidLinkFlow();

    expect(result.isReady).toBe(false);
    expect(result.isPending).toBe(false);
  });

  it('connect calls mutate', () => {
    const { connect } = usePlaidLinkFlow();

    connect();

    expect(mockMutate).toHaveBeenCalled();
  });

  it('auto-opens when linkToken and ready are true', () => {
    stateValue = 'test-link-token';
    mockReady = true;

    usePlaidLinkFlow();

    if (effectCallback) effectCallback();

    expect(mockOpen).toHaveBeenCalled();
  });

  it('does not auto-open when ready is false', () => {
    stateValue = 'test-link-token';
    mockReady = false;

    usePlaidLinkFlow();

    if (effectCallback) effectCallback();

    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('does not auto-open when linkToken is null', () => {
    stateValue = null;
    mockReady = true;

    usePlaidLinkFlow();

    if (effectCallback) effectCallback();

    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('isReady is true when linkToken exists and ready', () => {
    stateValue = 'test-link-token';
    mockReady = true;

    const result = usePlaidLinkFlow();

    expect(result.isReady).toBe(true);
  });

  it('isPending reflects mutation state', () => {
    mockIsPending = true;

    const result = usePlaidLinkFlow();

    expect(result.isPending).toBe(true);
  });
});
