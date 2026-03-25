import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { loginAction } from '../actions/login.action';
import { loginUserSchema } from '../schema/login.schema';

const useLoginForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: loginAction,
    onSuccess: (result) => {
      if (result.success) router.push('/dashboard');
      else console.log('trigger error toast', result.message);
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
