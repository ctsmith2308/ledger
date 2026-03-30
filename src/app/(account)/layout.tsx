import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/app/_lib/query';

import { loadSession } from '@/app/_entities/identity';
import { queryKeys } from '@/app/_entities/shared';

import { AppHeader } from '@/app/_widgets';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();
  const session = await loadSession();

  queryClient.setQueryData(queryKeys.session, session);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-background">
        <AppHeader />

        <div className="pt-14">
          {children}
        </div>
      </div>
    </HydrationBoundary>
  );
}
