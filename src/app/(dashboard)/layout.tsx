import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/app/_shared/lib/query';

import { loadLayoutData } from '@/app/_shared/lib/session/load-layout-data';

import { DashboardLayout } from '@/app/_layouts/dashboard-layout';

export default async function DashboardRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  await loadLayoutData(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardLayout>{children}</DashboardLayout>
    </HydrationBoundary>
  );
}
