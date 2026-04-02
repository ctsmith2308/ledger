'use client';

import { useRef } from 'react';

import { useRouter } from 'next/navigation';

import { useForm } from '@tanstack/react-form';

import { useMutation } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';

import { updateUserProfileAction } from '@/app/_entities/identity/actions';

import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/app/_entities/identity/schema';

const useUpdateProfileForm = (initial: {
  firstName: string;
  lastName: string;
}) => {
  const router = useRouter();
  const pendingValues = useRef<UpdateProfileInput | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: (input: UpdateProfileInput) =>
      handleActionResponse(updateUserProfileAction(input)),
    onSuccess: () => {
      router.refresh();
    },
  });

  const form = useForm({
    defaultValues: {
      firstName: initial.firstName,
      lastName: initial.lastName,
    },
    validators: { onSubmit: updateProfileSchema },
    onSubmit: ({ value }) => {
      pendingValues.current = value;
    },
  });

  const onConfirm = () => {
    if (pendingValues.current) {
      mutate(pendingValues.current);
      pendingValues.current = null;
    }
  };

  return { form, formId: 'update-profile-form', isPending, onConfirm };
};

type UpdateProfileFormApi = ReturnType<typeof useUpdateProfileForm>['form'];

export { useUpdateProfileForm, type UpdateProfileFormApi };
