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

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn(),
}));

vi.mock('@/app/_entities/identity/actions', () => ({
  deleteAccountAction: vi.fn(),
}));

import { useDeleteAccount } from '../use-delete-account.hook';

describe('useDeleteAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    onSuccessCallback = null;
  });

  it('returns deleteAccount function and isDeleting', () => {
    const { deleteAccount, isDeleting } = useDeleteAccount();

    expect(isDeleting).toBe(false);
  });

  it('deleteAccount calls mutate', () => {
    const { deleteAccount } = useDeleteAccount();

    deleteAccount();

    expect(mockMutate).toHaveBeenCalled();
  });

  it('navigates to login on success', () => {
    useDeleteAccount();

    if (onSuccessCallback) onSuccessCallback();

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('reflects pending state', () => {
    mockIsPending = true;

    const { isDeleting } = useDeleteAccount();

    expect(isDeleting).toBe(true);
  });
});
