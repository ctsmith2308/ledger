'use client';

import { AlertCircle } from 'lucide-react';

import { Button } from '@/app/_components';

function ErrorView({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
        <AlertCircle className="size-10 text-destructive" />

        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h2>

        <p className="leading-7 text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>

        <Button onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}

export { ErrorView };
