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

vi.mock('@/app/_entities/budgets/actions/update-budget.action', () => ({
  updateBudgetAction: vi.fn(),
}));

vi.mock('@/app/_entities/budgets/schema/update-budget.schema', () => ({}));

vi.mock('@/app/_shared/lib/query/query-keys', () => ({
  queryKeys: { budgetOverview: ['budget-overview'] },
}));

import { useUpdateBudget } from '../use-update-budget.hook';

describe('useUpdateBudget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    onSuccessCallback = null;
  });

  it('returns updateBudget function and isUpdating', () => {
    const { updateBudget, isUpdating } = useUpdateBudget();

    expect(isUpdating).toBe(false);
    expect(updateBudget).toBeDefined();
  });

  it('updateBudget calls mutate', () => {
    const { updateBudget } = useUpdateBudget();

    updateBudget({ budgetId: 'b-1', monthlyLimit: 500 });

    expect(mockMutate).toHaveBeenCalledWith({
      budgetId: 'b-1',
      monthlyLimit: 500,
    });
  });

  it('invalidates budget overview cache on success', () => {
    useUpdateBudget();

    if (onSuccessCallback) onSuccessCallback();

    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('reflects pending state', () => {
    mockIsPending = true;

    const { isUpdating } = useUpdateBudget();

    expect(isUpdating).toBe(true);
  });
});
