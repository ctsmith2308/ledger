import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/app/_lib/query';

import { loadSession } from '@/app/_entities/identity';
import { queryKeys } from '@/app/_entities/shared';

import { DashboardSidebar } from '@/app/_widgets';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  const session = await loadSession();

  queryClient.setQueryData(queryKeys.session, session);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="h-screen overflow-hidden bg-background">
        <DashboardSidebar>
          {children}
        </DashboardSidebar>
      </div>
    </HydrationBoundary>
  );
}
