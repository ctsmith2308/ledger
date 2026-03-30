'use client';

import { useQuery } from '@tanstack/react-query';

import { type JwtData } from '@/core/shared/domain';

import { queryKeys } from '@/app/_entities/shared';

const useSession = () => {
  return useQuery<JwtData>({
    queryKey: queryKeys.session,
    staleTime: Infinity,
  });
};

export { useSession };
