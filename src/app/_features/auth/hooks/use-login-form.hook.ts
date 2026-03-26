import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';
import { loginAction } from '../actions/login.action';
import { loginUserSchema } from '../schema/login.schema';

const useLoginForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      execute(loginAction(input)),
    onSuccess: () => {
      router.push('/dashboard');
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
