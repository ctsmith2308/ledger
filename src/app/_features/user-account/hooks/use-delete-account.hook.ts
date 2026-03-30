'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';
import { ROUTES } from '@/app/_lib/config';

import { deleteAccountAction } from '@/app/_entities/identity/actions';

const useDeleteAccount = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: () => execute(deleteAccountAction()),
    onSuccess: () => {
      router.push(ROUTES.login);
    },
  });

  return { deleteAccount: mutate, isDeleting: isPending };
};

export { useDeleteAccount };
