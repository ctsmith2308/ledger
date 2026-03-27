import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';

import {
  registerAction,
  registerUserSchema,
  type RegisterUserInput,
} from '@/app/_entities/identity';

const useRegisterForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: RegisterUserInput) =>
      execute(registerAction(input)),
    onSuccess: () => {
      router.push('/login');
    },
  });

  const form = useForm({
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
    validators: { onSubmit: registerUserSchema },
    onSubmit: ({ value }) => mutate(value),
  });

  return { form, formId: 'register-account-form', isPending };
};

type RegisterFormApi = ReturnType<typeof useRegisterForm>['form'];

export { useRegisterForm, type RegisterFormApi };
