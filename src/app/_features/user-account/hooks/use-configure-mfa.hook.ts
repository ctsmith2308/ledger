import { useState } from 'react';

import { useForm } from '@tanstack/react-form';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';
import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import {
  setupMfaAction,
  verifyMfaSetupAction,
  disableMfaAction,
} from '@/app/_entities/identity/actions';

const MFA_PROGRESS = {
  IDLE: 'idle',
  SHOWING_QR: 'showing_qr',
  SUCCESS: 'success',
} as const;

type MfaProgress = (typeof MFA_PROGRESS)[keyof typeof MFA_PROGRESS];

const useConfigureMfa = () => {
  const queryClient = useQueryClient();
  const [mfaProgress, setMfaProgress] = useState<MfaProgress>(
    MFA_PROGRESS.IDLE,
  );
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const setupMutation = useMutation({
    mutationFn: () => handleActionResponse(setupMfaAction()),
    onSuccess: (result) => {
      if (result?.qrCodeDataUrl) {
        setQrCodeDataUrl(result.qrCodeDataUrl);
        setMfaProgress(MFA_PROGRESS.SHOWING_QR);
      }
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (input: { totpCode: string }) =>
      handleActionResponse(verifyMfaSetupAction(input)),
    onSuccess: () => {
      setMfaProgress(MFA_PROGRESS.SUCCESS);
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => handleActionResponse(disableMfaAction()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userAccount });
    },
  });

  const form = useForm({
    defaultValues: { totpCode: '' },
    onSubmit: ({ value }) => verifyMutation.mutate(value),
  });

  const reset = () => {
    setMfaProgress(MFA_PROGRESS.IDLE);
    setQrCodeDataUrl(null);
    form.reset();
  };

  return {
    mfaProgress,
    qrCodeDataUrl,
    enableMfa: setupMutation.mutate,
    verifyMfa: verifyMutation.mutate,
    disableMfa: disableMutation.mutate,
    isEnabling: setupMutation.isPending,
    isVerifying: verifyMutation.isPending,
    isDisabling: disableMutation.isPending,
    form,
    formId: 'mfa-setup-form',
    reset,
  };
};

export { useConfigureMfa, MFA_PROGRESS };
