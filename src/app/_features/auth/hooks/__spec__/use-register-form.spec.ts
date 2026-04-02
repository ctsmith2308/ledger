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

vi.mock('@tanstack/react-form', () => ({
  useForm: (opts: { defaultValues: unknown; onSubmit: unknown }) => ({
    ...opts,
    handleSubmit: vi.fn(),
    setFieldValue: vi.fn(),
  }),
}));

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn((action: unknown) => action),
}));

vi.mock('@/app/_entities/identity/actions', () => ({
  registerAction: vi.fn((input: unknown) => input),
}));

vi.mock('@/app/_entities/identity/schema', () => ({
  registerUserSchema: {},
}));

vi.mock('@/app/_shared/routes', () => ({
  ROUTES: { login: '/login' },
}));

import { useRegisterForm } from '../use-register-form.hook';

describe('useRegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    onSuccessCallback = null;
  });

  it('returns form, formId, and isPending', () => {
    const result = useRegisterForm();

    expect(result.formId).toBe('register-account-form');
    expect(result.isPending).toBe(false);
    expect(result.form).toBeDefined();
  });

  it('navigates to login on success', () => {
    useRegisterForm();

    if (onSuccessCallback) onSuccessCallback();

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('reflects pending state', () => {
    mockIsPending = true;

    const { isPending } = useRegisterForm();

    expect(isPending).toBe(true);
  });
});
