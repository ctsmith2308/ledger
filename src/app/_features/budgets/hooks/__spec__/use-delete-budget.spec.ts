import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRefresh = vi.fn();
const mockMutate = vi.fn();
let mockIsPending = false;
let onSuccessCallback: (() => void) | null = null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: mockRefresh }),
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

vi.mock('@/app/_entities/budgets/actions', () => ({
  deleteBudgetAction: vi.fn(),
}));

import { useDeleteBudget } from '../use-delete-budget.hook';

describe('useDeleteBudget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    onSuccessCallback = null;
  });

  it('returns deleteBudget function and isDeleting', () => {
    const { deleteBudget, isDeleting } = useDeleteBudget();

    expect(isDeleting).toBe(false);
  });

  it('deleteBudget calls mutate', () => {
    const { deleteBudget } = useDeleteBudget();

    deleteBudget('budget-123');

    expect(mockMutate).toHaveBeenCalledWith('budget-123');
  });

  it('refreshes router on success', () => {
    useDeleteBudget();

    if (onSuccessCallback) onSuccessCallback();

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('reflects pending state', () => {
    mockIsPending = true;

    const { isDeleting } = useDeleteBudget();

    expect(isDeleting).toBe(true);
  });
});
