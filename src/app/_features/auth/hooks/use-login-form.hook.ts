import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';
import { ROUTES } from '@/app/_lib/config';

import { loginAction } from '@/app/_entities/identity/actions';

import {
  loginUserSchema,
  type LoginUserInput,
} from '@/app/_entities/identity/schema';

const useLoginForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: LoginUserInput) => execute(loginAction(input)),
    onSuccess: () => {
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
