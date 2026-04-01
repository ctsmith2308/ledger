import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';

import {
  setupMfaAction,
  verifyMfaSetupAction,
  disableMfaAction,
} from '@/app/_entities/identity/actions';

type MfaProgress = 'idle' | 'showing_qr' | 'success';

const useConfigureMfa = () => {
  const router = useRouter();
  const [mfaProgress, setStep] = useState<MfaProgress>('idle');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);

  const setupMutation = useMutation({
    mutationFn: () => handleActionResponse(setupMfaAction()),
    onSuccess: (result) => {
      if (result?.qrCodeDataUrl) {
        setQrCodeDataUrl(result.qrCodeDataUrl);
        setStep('showing_qr');
      }
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (input: { totpCode: string }) =>
      handleActionResponse(verifyMfaSetupAction(input)),
    onSuccess: () => {
      setStep('success');
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => handleActionResponse(disableMfaAction()),
    onSuccess: () => {
      router.refresh();
    },
  });

  const form = useForm({
    defaultValues: { totpCode: '' },
    onSubmit: ({ value }) => verifyMutation.mutate(value),
  });

  const reset = () => {
    setStep('idle');
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

export { useConfigureMfa };
