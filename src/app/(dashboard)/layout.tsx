import { redirect } from 'next/navigation';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { DomainException } from '@/core/shared/domain';

import { ROUTES } from '@/app/_lib/config';
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

  try {
    const session = await loadSession();
    queryClient.setQueryData(queryKeys.session, session);
  } catch (error) {
    if (error instanceof DomainException) {
      redirect(ROUTES.login);
    }

    throw error;
  }

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
