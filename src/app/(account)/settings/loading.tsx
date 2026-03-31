import { Skeleton } from '@/app/_components';

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>

      <Skeleton className="h-48 w-full rounded-xl" />

      <Skeleton className="h-36 w-full rounded-xl" />
    </div>
  );
}
