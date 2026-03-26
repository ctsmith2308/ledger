'use client';

import { AlertCircle } from 'lucide-react';

function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="mx-auto max-w-md text-center">
            <AlertCircle className="mx-auto size-10 text-red-500" />

            <h2 className="mt-4 text-2xl font-semibold tracking-tight">
              Something went wrong
            </h2>

            <p className="mt-2 leading-7 text-muted-foreground">
              An unexpected error occurred. Please try again.
            </p>

            <button
              onClick={reset}
              className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

export default GlobalError;
