'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { handleActionResponse } from '@/app/_shared/lib/next-safe-action';
import { ROUTES } from '@/app/_shared/routes';

import { logoutAction } from '@/app/_entities/identity/actions';

const useLogout = () => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: () => handleActionResponse(logoutAction()),
    onSuccess: () => {
      router.push(ROUTES.login);
    },
  });

  return { logout: mutate, isPending };
};

export { useLogout };
