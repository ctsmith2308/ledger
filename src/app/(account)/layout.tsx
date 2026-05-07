import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/app/_shared/lib/query';

import { loadLayoutData } from '@/app/_shared/lib/session/load-layout-data';

import { AppMenuBar } from '@/app/_widgets';

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  await loadLayoutData(queryClient);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen bg-background">
        <AppMenuBar />

        <div className="pt-14">{children}</div>
      </div>
    </HydrationBoundary>
  );
}
