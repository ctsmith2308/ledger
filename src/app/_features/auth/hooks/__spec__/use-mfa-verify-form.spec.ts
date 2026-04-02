import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockMutate = vi.fn();
let mockIsPending = false;
let onSuccessCallback: (() => void) | null = null;
let mutationFn: ((input: { totpCode: string }) => unknown) | null = null;

const mockSessionStorage: Record<string, string | null> = {};

vi.stubGlobal('sessionStorage', {
  getItem: (key: string) => mockSessionStorage[key] ?? null,
  setItem: (key: string, value: string) => {
    mockSessionStorage[key] = value;
  },
  removeItem: (key: string) => {
    delete mockSessionStorage[key];
  },
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, refresh: vi.fn() }),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: (opts: {
    mutationFn: (input: { totpCode: string }) => unknown;
    onSuccess?: () => void;
  }) => {
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

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn(),
}));

vi.mock('@/app/_entities/identity/actions', () => ({
  verifyMfaLoginAction: vi.fn(),
}));

vi.mock('@/app/_shared/routes', () => ({
  ROUTES: { login: '/login', overview: '/overview' },
}));

import { useMfaVerifyForm } from '../use-mfa-verify-form.hook';

describe('useMfaVerifyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    onSuccessCallback = null;
    mutationFn = null;
    delete mockSessionStorage['mfa_challenge'];
  });

  it('returns form, formId, and isPending', () => {
    const result = useMfaVerifyForm();

    expect(result.formId).toBe('mfa-verify-form');
    expect(result.isPending).toBe(false);
    expect(result.form).toBeDefined();
  });

  it('redirects to login when no challenge token exists', async () => {
    useMfaVerifyForm();

    if (mutationFn) await mutationFn({ totpCode: '123456' });

    expect(mockReplace).toHaveBeenCalledWith('/login');
  });

  it('removes challenge token and navigates to overview on success', () => {
    mockSessionStorage['mfa_challenge'] = 'test-token';

    useMfaVerifyForm();

    if (onSuccessCallback) onSuccessCallback();

    expect(mockSessionStorage['mfa_challenge']).toBeUndefined();
    expect(mockPush).toHaveBeenCalledWith('/overview');
  });

  it('reflects pending state', () => {
    mockIsPending = true;

    const { isPending } = useMfaVerifyForm();

    expect(isPending).toBe(true);
  });
});
