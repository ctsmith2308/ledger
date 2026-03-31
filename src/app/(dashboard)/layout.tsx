import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/app/_shared/lib/query';

import { loadSession } from '@/app/_shared/lib/session/session.service';

import { queryKeys } from '@/app/_shared/lib/query/query-keys';

import { DashboardLayout } from '@/app/_layouts/dashboard-layout';

export default async function DashboardRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  const session = await loadSession();

  queryClient.setQueryData(queryKeys.session, session);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardLayout>{children}</DashboardLayout>
    </HydrationBoundary>
  );
}
