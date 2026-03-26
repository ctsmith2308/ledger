'use client';

import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { ActionError } from '@/app/_lib/safe-action';
import { Toast } from '@/app/_components/toast';

const NON_RETRYABLE_CODES = ['UNAUTHORIZED', 'RATE_LIMIT_EXCEEDED'];

function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (_, error) => {
              if (error instanceof ActionError) {
                return !NON_RETRYABLE_CODES.includes(error.code);
              }
              return false;
            },
          },
        },

        queryCache: new QueryCache({
          onError: (error, query) => {
            if (query.meta?.silent) return;
            toast.error(error.message);
          },
        }),

        mutationCache: new MutationCache({
          onError: (error, _, __, mutation) => {
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
