import { redirect } from 'next/navigation';

import { QueryClient } from '@tanstack/react-query';

import { UnauthorizedException } from '@/core/shared/domain';

import { featureFlagCache } from '@/core/shared/infrastructure';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import { loadSession } from './session.service';

const loadLayoutData = async (queryClient: QueryClient) => {
  let session;
  try {
    session = await loadSession();
  } catch (error) {
    if (error instanceof UnauthorizedException) redirect('/login');
    throw error;
  }

  let features: string[] = [];
  try {
    features = (await featureFlagCache.getFeatures(session.userId)) ?? [];
  } catch {
    // Cache failure is non-fatal — degrade to no feature flags
  }

  queryClient.setQueryData(queryKeys.session, session);
  queryClient.setQueryData(queryKeys.featureFlags, features);
};

export { loadLayoutData };
