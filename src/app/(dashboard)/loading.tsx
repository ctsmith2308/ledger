import { Skeleton } from '@/app/_components';
import { PageContainer } from '@/app/_widgets';

export default function Loading() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />

        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />

        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </PageContainer>
  );
}
