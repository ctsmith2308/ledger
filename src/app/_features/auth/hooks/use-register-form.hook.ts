import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';
import { ROUTES } from '@/app/_lib/config';

import { registerAction } from '@/app/_entities/identity/actions';
import {
  registerUserSchema,
  type RegisterUserInput,
} from '@/app/_entities/identity/schema';

const useRegisterForm = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: RegisterUserInput) =>
      execute(registerAction(input)),
    onSuccess: () => {
      router.push(ROUTES.login);
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
