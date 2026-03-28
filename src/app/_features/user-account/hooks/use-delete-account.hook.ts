'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';

import { deleteAccountAction } from '@/app/_entities/identity';

const useDeleteAccount = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: () => execute(deleteAccountAction()),
    onSuccess: () => {
      router.push('/login');
    },
  });

  return { deleteAccount: mutate, isDeleting: isPending };
};

export { useDeleteAccount };
