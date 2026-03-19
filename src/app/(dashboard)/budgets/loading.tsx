import { LoadingSkeleton } from '@/app/_components/loading-skeleton.component';

function Loading() {
  // Add fallback UI that will be shown while the route is loading.
  return <LoadingSkeleton />;
}

export default Loading;
