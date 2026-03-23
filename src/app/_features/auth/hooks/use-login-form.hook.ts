import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { loginAction } from '../actions/login.action';
import {
  loginUserSchema,
  type LoginUserInput,
} from '@/core/modules/identity/application/schema/login-user.schema';

const useLoginForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: LoginUserInput) => loginAction(data),
    onSuccess: (result) => {
      if (result.success) router.push('/dashboard');
      else console.log('trigger error toast', result.message);
    },
  });

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: loginUserSchema },
    onSubmit: async ({ value }) => {
      mutate(value);
    },
  });

  return { form, formId: 'login-form', isPending };
};

type LoginFormApi = ReturnType<typeof useLoginForm>['form'];

export { useLoginForm, type LoginFormApi };
