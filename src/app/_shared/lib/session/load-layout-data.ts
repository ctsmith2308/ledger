import { redirect } from 'next/navigation';

import { QueryClient } from '@tanstack/react-query';

import { UnauthorizedException } from '@/core/shared/domain';

import { identityService } from '@/core/modules/identity';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import { loadSession } from './session.service';

const loadLayoutData = async (queryClient: QueryClient) => {
  try {
    const session = await loadSession();
    const account = await identityService.getUserAccount(session.userId);

    queryClient.setQueryData(queryKeys.session, session);
    queryClient.setQueryData(queryKeys.userAccount, account);
    queryClient.setQueryData(queryKeys.featureFlags, account.features);
  } catch (error) {
    if (error instanceof UnauthorizedException) redirect('/login');

    throw error;
  }
};

export { loadLayoutData };
