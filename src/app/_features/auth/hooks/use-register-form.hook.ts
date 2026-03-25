import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { registerAction } from '../actions/register.action';
import { registerUserSchema } from '../schema/register.schema';

const useRegisterForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: registerAction,
    onSuccess: (result) => {
      if (result.success) router.push('/login');
      else console.log('trigger error toast', result.message);
    },
  });

  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: registerUserSchema },
    onSubmit: ({ value }) => mutate(value),
  });

  return { form, formId: 'register-account-form', isPending };
};

type RegisterFormApi = ReturnType<typeof useRegisterForm>['form'];

export { useRegisterForm, type RegisterFormApi };
