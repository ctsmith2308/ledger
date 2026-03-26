'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '@/app/_components';

function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <AlertCircle className="mx-auto size-10 text-destructive" />

        <h2 className="mt-4 scroll-m-20 text-2xl font-semibold tracking-tight">
          Something went wrong
        </h2>

        <p className="mt-2 leading-7 text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>

        <Button onClick={reset} className="mt-6">
          Try again
        </Button>
      </div>
    </div>
  );
}

export default DashboardError;
