import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';
import { registerAction } from '../actions/register.action';
import { registerUserSchema } from '../schema/register.schema';

const useRegisterForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      execute(registerAction(input)),
    onSuccess: () => {
      router.push('/login');
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
