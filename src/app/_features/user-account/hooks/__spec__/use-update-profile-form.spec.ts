import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRefresh = vi.fn();
const mockMutate = vi.fn();
let mockIsPending = false;
let onSuccessCallback: (() => void) | null = null;
let mockRefCurrent: unknown = null;

vi.mock('react', () => ({
  useRef: (initial: unknown) => {
    const ref = { current: initial };
    Object.defineProperty(ref, 'current', {
      get: () => mockRefCurrent,
      set: (val: unknown) => {
        mockRefCurrent = val;
      },
    });
    return ref;
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: mockRefresh }),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation: (opts: { onSuccess?: () => void }) => {
    onSuccessCallback = opts.onSuccess ?? null;
    return { mutate: mockMutate, isPending: mockIsPending };
  },
}));

vi.mock('@tanstack/react-form', () => ({
  useForm: (opts: {
    defaultValues: unknown;
    onSubmit: ({ value }: { value: unknown }) => void;
  }) => ({
    ...opts,
    handleSubmit: vi.fn(),
    setFieldValue: vi.fn(),
    triggerSubmit: () =>
      opts.onSubmit({
        value: { firstName: 'Jane', lastName: 'Smith' },
      }),
  }),
}));

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn(),
}));

vi.mock('@/app/_entities/identity/actions', () => ({
  updateUserProfileAction: vi.fn(),
}));

vi.mock('@/app/_entities/identity/schema', () => ({
  updateProfileSchema: {},
}));

import { useUpdateProfileForm } from '../use-update-profile-form.hook';

describe('useUpdateProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    onSuccessCallback = null;
    mockRefCurrent = null;
  });

  it('returns form, formId, isPending, and onConfirm', () => {
    const result = useUpdateProfileForm({
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(result.formId).toBe('update-profile-form');
    expect(result.isPending).toBe(false);
    expect(result.form).toBeDefined();
    expect(result.onConfirm).toBeDefined();
  });

  it('onConfirm calls mutate with pending values', () => {
    const { onConfirm } = useUpdateProfileForm({
      firstName: 'John',
      lastName: 'Doe',
    });

    mockRefCurrent = { firstName: 'Jane', lastName: 'Smith' };

    onConfirm();

    expect(mockMutate).toHaveBeenCalledWith({
      firstName: 'Jane',
      lastName: 'Smith',
    });
  });

  it('onConfirm clears pending values after mutate', () => {
    const { onConfirm } = useUpdateProfileForm({
      firstName: 'John',
      lastName: 'Doe',
    });

    mockRefCurrent = { firstName: 'Jane', lastName: 'Smith' };

    onConfirm();

    expect(mockRefCurrent).toBeNull();
  });

  it('onConfirm does nothing when no pending values', () => {
    const { onConfirm } = useUpdateProfileForm({
      firstName: 'John',
      lastName: 'Doe',
    });

    mockRefCurrent = null;

    onConfirm();

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('refreshes router on success', () => {
    useUpdateProfileForm({ firstName: 'John', lastName: 'Doe' });

    if (onSuccessCallback) onSuccessCallback();

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('reflects pending state', () => {
    mockIsPending = true;

    const { isPending } = useUpdateProfileForm({
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(isPending).toBe(true);
  });
});
