'use client';

import { useState } from 'react';

import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';

import { toast } from 'sonner';

import { ActionError } from '@/app/_shared/lib/next-safe-action/action-error';

import { queryDefaults } from '@/app/_shared/lib/query/query-defaults';

import { Toast } from '@/app/_components';

const isUnauthorized = (error: Error): boolean =>
  error instanceof ActionError && error.code === 'UNAUTHORIZED';

function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: queryDefaults,

        queryCache: new QueryCache({
          onError: (error, query) => {
            if (isUnauthorized(error)) {
              window.location.href = '/login';
              return;
            }

            if (query.meta?.silent) return;

            toast.error(error.message);
          },
        }),

        mutationCache: new MutationCache({
          onError: (error, _, __, mutation) => {
            if (isUnauthorized(error)) {
              window.location.href = '/login';
              return;
            }

            if (mutation.meta?.silent) return;

            toast.error(error.message);
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      <Toast position="bottom-right" />
    </QueryClientProvider>
  );
}

export { QueryProvider };
