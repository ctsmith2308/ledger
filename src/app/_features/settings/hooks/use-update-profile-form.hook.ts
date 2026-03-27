'use client';

import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';

import {
  updateUserProfileAction,
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/app/_entities/identity';

const useUpdateProfileForm = (initial: { firstName: string; lastName: string }) => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      execute(updateUserProfileAction(input)),
    onSuccess: () => {
      router.refresh();
    },
  });

  const form = useForm({
    defaultValues: { firstName: initial.firstName, lastName: initial.lastName },
    validators: { onSubmit: updateProfileSchema },
    onSubmit: ({ value }) => mutate(value),
  });

  return { form, formId: 'update-profile-form', isPending };
};

type UpdateProfileFormApi = ReturnType<typeof useUpdateProfileForm>['form'];

export { useUpdateProfileForm, type UpdateProfileFormApi };
