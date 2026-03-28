import { Skeleton } from '@/app/_components';
import { PageContainer } from '@/app/_widgets';

export default function Loading() {
  return (
    <PageContainer>
      <div className="mb-8">
        <Skeleton className="h-8 w-32" />

        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <Skeleton className="h-10 w-full rounded-xl" />

      <div className="mt-2 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </PageContainer>
  );
}
