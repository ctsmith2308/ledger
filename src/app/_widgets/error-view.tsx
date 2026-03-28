'use client';

import { AlertCircle } from 'lucide-react';

import { Button } from '@/app/_components';

function ErrorView({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <AlertCircle className="mx-auto size-10 text-destructive" />

        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
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

export { ErrorView };
