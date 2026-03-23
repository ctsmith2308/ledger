import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { registerAction } from '../actions/register.action';
import {
  registerUserSchema,
  type RegisterUserInput,
} from '@/core/modules/identity/application/schema';

const useRegisterForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RegisterUserInput) => registerAction(data),
    onSuccess: (result) => {
      if (result.success) router.push('/login');
      else console.log('trigger error toast', result.message);
    },
  });

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: registerUserSchema },
    onSubmit: async ({ value }) => {
      mutate(value);
    },
  });

  return { form, formId: 'register-account-form', isPending };
};

type RegisterFormApi = ReturnType<typeof useRegisterForm>['form'];

export { useRegisterForm, registerUserSchema, type RegisterFormApi };
