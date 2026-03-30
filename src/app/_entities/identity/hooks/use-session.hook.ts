'use client';

import { useQuery } from '@tanstack/react-query';

import { type SessionDTO } from '@/core/modules/identity';

import { queryKeys } from '@/app/_entities/shared';

const useSession = () => {
  return useQuery<SessionDTO>({
    queryKey: queryKeys.session,
    staleTime: Infinity,
  });
};

export { useSession };
