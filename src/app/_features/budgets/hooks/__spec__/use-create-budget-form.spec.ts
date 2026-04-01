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

vi.mock('@tanstack/react-form', () => ({
  useForm: (opts: { defaultValues: unknown; onSubmit: unknown }) => ({
    ...opts,
    handleSubmit: vi.fn(),
    setFieldValue: vi.fn(),
  }),
}));

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn(),
}));

vi.mock('@/app/_entities/budgets/actions', () => ({
  createBudgetAction: vi.fn(),
}));

vi.mock('@/app/_entities/budgets/schema', () => ({}));

vi.mock('../schema/create-budget-form.schema', () => ({
  createBudgetFormSchema: {},
}));

import { useCreateBudgetForm } from '../use-create-budget-form.hook';

describe('useCreateBudgetForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    onSuccessCallback = null;
  });

  it('returns form, formId, and isPending', () => {
    const result = useCreateBudgetForm();

    expect(result.formId).toBe('create-budget-form');
    expect(result.isPending).toBe(false);
    expect(result.form).toBeDefined();
  });

  it('invalidates budget overview cache on success', () => {
    useCreateBudgetForm();

    if (onSuccessCallback) onSuccessCallback();

    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('reflects pending state', () => {
    mockIsPending = true;

    const { isPending } = useCreateBudgetForm();

    expect(isPending).toBe(true);
  });
});
