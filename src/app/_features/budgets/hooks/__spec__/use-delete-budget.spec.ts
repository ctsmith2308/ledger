import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInvalidateQueries = vi.fn();
const mockMutate = vi.fn();
let mockIsPending = false;
let onSuccessCallback: (() => void) | null = null;

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
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

  it('invalidates budget overview cache on success', () => {
    useDeleteBudget();

    if (onSuccessCallback) onSuccessCallback();

    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('reflects pending state', () => {
    mockIsPending = true;

    const { isDeleting } = useDeleteBudget();

    expect(isDeleting).toBe(true);
  });
});
