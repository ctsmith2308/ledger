import { Skeleton } from '@/app/_components';
import { PageContainer } from '@/app/_widgets';

export default function Loading() {
  return (
    <PageContainer>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />

        <Skeleton className="h-4 w-48" />
      </div>

      {/* Spending callouts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton className="h-16 rounded-xl" />

        <Skeleton className="h-16 rounded-xl" />
      </div>

      {/* Transactions */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-40" />

        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full rounded-xl" />

          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Account totals */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-32" />

        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </PageContainer>
  );
}
