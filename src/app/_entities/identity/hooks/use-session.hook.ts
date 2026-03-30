'use client';

import { useQueryClient } from '@tanstack/react-query';

import { type JwtData } from '@/core/shared/domain';

import { queryKeys } from '@/app/_entities/shared/query-keys';

const useSession = () => {
  const queryClient = useQueryClient();

  return queryClient.getQueryData<JwtData>(queryKeys.session) ?? null;
};

export { useSession };
