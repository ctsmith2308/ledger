import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPush = vi.fn();
const mockMutate = vi.fn();
let mockIsPending = false;
let onSuccessCallback: (() => void) | null = null;
let mutationFn: ((input: unknown) => unknown) | null = null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: vi.fn() }),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: (opts: { mutationFn: (input: unknown) => unknown; onSuccess?: () => void }) => {
    mutationFn = opts.mutationFn;
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

vi.mock('@/app/_lib/safe-action', () => ({
  execute: vi.fn((action: unknown) => action),
}));

vi.mock('@/app/_entities/identity/actions', () => ({
  loginAction: vi.fn((input: unknown) => input),
}));

vi.mock('@/app/_entities/identity/schema', () => ({
  loginUserSchema: {},
}));

import { useLoginForm } from '../use-login-form.hook';

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    onSuccessCallback = null;
    mutationFn = null;
  });

  it('returns form, formId, and isPending', () => {
    const result = useLoginForm();

    expect(result.formId).toBe('login-form');
    expect(result.isPending).toBe(false);
    expect(result.form).toBeDefined();
  });

  it('navigates to overview on success', () => {
    useLoginForm();

    if (onSuccessCallback) onSuccessCallback();

    expect(mockPush).toHaveBeenCalledWith('/overview');
  });

  it('reflects pending state', () => {
    mockIsPending = true;

    const { isPending } = useLoginForm();

    expect(isPending).toBe(true);
  });
});
