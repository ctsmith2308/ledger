import { Skeleton } from '@/app/_components';
import { PageContainer } from '@/app/_widgets';

export default function Loading() {
  return (
    <PageContainer>
      <Skeleton className="h-8 w-40" />

      <Skeleton className="mt-2 h-4 w-64" />

      <div className="mt-8 space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />

        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </PageContainer>
  );
}
