import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';
import { ROUTES } from '@/app/_shared/routes';

import { verifyMfaLoginAction } from '@/app/_entities/identity/actions';

const useMfaVerifyForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: async (input: { totpCode: string }) => {
      const challengeToken = sessionStorage.getItem('mfa_challenge');

      if (!challengeToken) {
        router.replace(ROUTES.login);
        return;
      }

      await handleActionResponse(
        verifyMfaLoginAction({
          challengeToken,
          totpCode: input.totpCode,
        }),
      );
    },
    onSuccess: () => {
      sessionStorage.removeItem('mfa_challenge');
      router.push(ROUTES.overview);
    },
  });

  const form = useForm({
    defaultValues: { totpCode: '' },
    onSubmit: ({ value }) => mutate(value),
  });

  return { form, formId: 'mfa-verify-form', isPending };
};

type MfaVerifyFormApi = ReturnType<typeof useMfaVerifyForm>['form'];

export { useMfaVerifyForm, type MfaVerifyFormApi };
