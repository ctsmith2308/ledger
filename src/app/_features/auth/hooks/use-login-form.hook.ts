import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';
import { ROUTES } from '@/app/_shared/routes';

import { loginAction } from '@/app/_entities/identity/actions';

import {
  loginUserSchema,
  type LoginUserInput,
} from '@/app/_entities/identity/schema';

const useLoginForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: LoginUserInput) => handleActionResponse(loginAction(input)),
    onSuccess: (result) => {
      if (result?.challengeToken) {
        sessionStorage.setItem('mfa_challenge', result.challengeToken);
        router.push(ROUTES.mfa);
        return;
      }

      router.push(ROUTES.overview);
    },
  });

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: loginUserSchema },
    onSubmit: ({ value }) => mutate(value),
  });

  return { form, formId: 'login-form', isPending };
};

type LoginFormApi = ReturnType<typeof useLoginForm>['form'];

export { useLoginForm, type LoginFormApi };
