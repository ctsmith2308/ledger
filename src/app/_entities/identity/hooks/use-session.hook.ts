'use client';

import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

type Session = {
  userId: string;
};

const useSession = () => {
  const queryClient = useQueryClient();

  return queryClient.getQueryData<Session>(queryKeys.session) ?? null;
};

export { useSession, type Session };
