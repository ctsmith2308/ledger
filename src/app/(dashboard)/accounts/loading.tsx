import { Skeleton } from '@/app/_components';
import { PageContainer } from '@/app/_widgets';

export default function Loading() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-36" />

        <Skeleton className="h-4 w-64" />
      </div>

      <Skeleton className="h-32 w-full rounded-xl" />

      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full rounded-xl" />

        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </PageContainer>
  );
}
