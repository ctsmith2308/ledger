import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInvalidateQueries = vi.fn();
let mockStateValues: Record<string, unknown> = {};
let mockSetters: Record<string, (val: unknown) => void> = {};
let stateIndex = 0;
const stateKeys = ['mfaProgress', 'qrCodeDataUrl'];

vi.mock('react', () => ({
  useState: (initial: unknown) => {
    const key = stateKeys[stateIndex % stateKeys.length];
    stateIndex++;
    const value =
      mockStateValues[key] !== undefined ? mockStateValues[key] : initial;
    const setter = (val: unknown) => {
      mockStateValues[key] = val;
    };
    mockSetters[key] = setter;
    return [value, setter];
  },
}));

const mockSetupMutate = vi.fn();
const mockVerifyMutate = vi.fn();
const mockDisableMutate = vi.fn();
let setupOnSuccess: ((result: { qrCodeDataUrl?: string }) => void) | null =
  null;
let verifyOnSuccess: (() => void) | null = null;
let disableOnSuccess: (() => void) | null = null;
let mockSetupIsPending = false;
let mockVerifyIsPending = false;
let mockDisableIsPending = false;
let mutationIndex = 0;

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
  useMutation: (opts: { onSuccess?: (...args: never[]) => void }) => {
    const idx = mutationIndex % 3;
    mutationIndex++;

    if (idx === 0) {
      setupOnSuccess = opts.onSuccess as typeof setupOnSuccess;
      return { mutate: mockSetupMutate, isPending: mockSetupIsPending };
    }

    if (idx === 1) {
      verifyOnSuccess = opts.onSuccess as typeof verifyOnSuccess;
      return { mutate: mockVerifyMutate, isPending: mockVerifyIsPending };
    }

    disableOnSuccess = opts.onSuccess as typeof disableOnSuccess;
    return { mutate: mockDisableMutate, isPending: mockDisableIsPending };
  },
}));

vi.mock('@tanstack/react-form', () => ({
  useForm: (opts: { defaultValues: unknown; onSubmit: unknown }) => ({
    ...opts,
    handleSubmit: vi.fn(),
    reset: vi.fn(),
  }),
}));

vi.mock('@/app/_shared/lib/next-safe-action', () => ({
  handleActionResponse: vi.fn(),
}));

vi.mock('@/app/_entities/identity/actions', () => ({
  setupMfaAction: vi.fn(),
  verifyMfaSetupAction: vi.fn(),
  disableMfaAction: vi.fn(),
}));

import { useConfigureMfa, MFA_PROGRESS } from '../use-configure-mfa.hook';

describe('useConfigureMfa', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStateValues = {};
    mockSetters = {};
    stateIndex = 0;
    mutationIndex = 0;
    setupOnSuccess = null;
    verifyOnSuccess = null;
    disableOnSuccess = null;
    mockSetupIsPending = false;
    mockVerifyIsPending = false;
    mockDisableIsPending = false;
  });

  it('returns initial idle state', () => {
    const result = useConfigureMfa();

    expect(result.mfaProgress).toBe('idle');
    expect(result.qrCodeDataUrl).toBeNull();
    expect(result.formId).toBe('mfa-setup-form');
    expect(result.isEnabling).toBe(false);
    expect(result.isVerifying).toBe(false);
    expect(result.isDisabling).toBe(false);
  });

  it('enableMfa calls setup mutation', () => {
    const { enableMfa } = useConfigureMfa();

    enableMfa();

    expect(mockSetupMutate).toHaveBeenCalled();
  });

  it('setup success transitions to showing_qr with qr data', () => {
    useConfigureMfa();

    if (setupOnSuccess)
      setupOnSuccess({ qrCodeDataUrl: 'data:image/png;base64,abc' });

    expect(mockStateValues['qrCodeDataUrl']).toBe(
      'data:image/png;base64,abc',
    );
    expect(mockStateValues['mfaProgress']).toBe(MFA_PROGRESS.SHOWING_QR);
  });

  it('verify success transitions to success state', () => {
    useConfigureMfa();

    if (verifyOnSuccess) verifyOnSuccess();

    expect(mockStateValues['mfaProgress']).toBe(MFA_PROGRESS.SUCCESS);
  });

  it('disable success invalidates user account query', () => {
    useConfigureMfa();

    if (disableOnSuccess) disableOnSuccess();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['user-account'],
    });
  });

  it('reflects enabling pending state', () => {
    mockSetupIsPending = true;

    const { isEnabling } = useConfigureMfa();

    expect(isEnabling).toBe(true);
  });

  it('reflects verifying pending state', () => {
    mockVerifyIsPending = true;

    const { isVerifying } = useConfigureMfa();

    expect(isVerifying).toBe(true);
  });

  it('reflects disabling pending state', () => {
    mockDisableIsPending = true;

    const { isDisabling } = useConfigureMfa();

    expect(isDisabling).toBe(true);
  });

  it('reset returns to idle state', () => {
    const { reset } = useConfigureMfa();

    reset();

    expect(mockStateValues['mfaProgress']).toBe(MFA_PROGRESS.IDLE);
    expect(mockStateValues['qrCodeDataUrl']).toBeNull();
  });
});
