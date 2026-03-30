import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPush = vi.fn();
const mockMutate = vi.fn();
let mockIsPending = false;
let onSuccessCallback: (() => void) | null = null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: (opts: { onSuccess?: () => void }) => {
    onSuccessCallback = opts.onSuccess ?? null;
    return { mutate: mockMutate, isPending: mockIsPending };
  },
}));

vi.mock('@/app/_lib/safe-action', () => ({
  execute: vi.fn(),
}));

vi.mock('@/app/_entities/identity/actions', () => ({
  logoutAction: vi.fn(),
}));

import { useLogout } from '../use-logout.hook';

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    onSuccessCallback = null;
  });

  it('returns logout function and isPending', () => {
    const { isPending } = useLogout();

    expect(isPending).toBe(false);
  });

  it('logout calls mutate', () => {
    const { logout } = useLogout();

    logout();

    expect(mockMutate).toHaveBeenCalled();
  });

  it('navigates to login on success', () => {
    useLogout();

    if (onSuccessCallback) onSuccessCallback();

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('reflects pending state', () => {
    mockIsPending = true;

    const { isPending } = useLogout();

    expect(isPending).toBe(true);
  });
});
