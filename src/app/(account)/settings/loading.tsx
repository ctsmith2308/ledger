import { Skeleton } from '@/app/_components';

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>

      <Skeleton className="h-48 w-full rounded-xl" />

      <Skeleton className="mt-6 h-36 w-full rounded-xl" />
    </div>
  );
}
