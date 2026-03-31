import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/app/_shared/lib/query';

import { loadSession } from '@/app/_shared/lib/session/session.service';
import { queryKeys } from '@/app/_shared/lib/query/query-keys';

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
