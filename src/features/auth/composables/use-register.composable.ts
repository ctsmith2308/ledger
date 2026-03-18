'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { authApi } from '../api';

const useRegisterUser = () => {
  const router = useRouter();

  const { mutate, isPending, error } = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => router.push('/login'),
  });

  return {
    register: mutate,
    loading: isPending,
    error,
  };
};

export { useRegisterUser };
