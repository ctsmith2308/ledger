import { Skeleton } from '@/app/_components';

import { PageContainer } from '@/app/_widgets';

export default function Loading() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />

        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full rounded-xl" />

        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </PageContainer>
  );
}
