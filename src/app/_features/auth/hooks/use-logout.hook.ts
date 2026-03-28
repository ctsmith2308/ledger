'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { execute } from '@/app/_lib/safe-action';

import { logoutAction } from '@/app/_entities/identity';

const useLogout = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: () => execute(logoutAction()),
    onSuccess: () => {
      router.push('/login');
    },
  });

  return { logout: mutate, isPending };
};

export { useLogout };
