'use client';

import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';

import { ROUTES } from '@/app/_shared/routes';

import { deleteAccountAction } from '@/app/_entities/identity/actions';

const useDeleteAccount = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: () => handleActionResponse(deleteAccountAction()),
    onSuccess: () => {
      router.push(ROUTES.login);
    },
  });

  return { deleteAccount: mutate, isDeleting: isPending };
};

export { useDeleteAccount };
