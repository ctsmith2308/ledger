import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/app/_shared/lib/query';

import { featureFlagCache } from '@/core/shared/infrastructure';

import { loadSession } from '@/app/_shared/lib/session/session.service';
import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import { AppMenuBar } from '@/app/_widgets';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  const session = await loadSession();

  const features = await featureFlagCache.getFeatures(session.userId) ?? [];

  queryClient.setQueryData(queryKeys.session, session);
  queryClient.setQueryData(queryKeys.featureFlags, features);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-background">
        <AppMenuBar />

        <div className="pt-14">{children}</div>
      </div>
    </HydrationBoundary>
  );
}
