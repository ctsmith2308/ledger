'use client';

import { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryDefaults } from '@/app/_lib/query/query-defaults';

import { Toast } from '@/app/_components/toast';

function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: queryDefaults,

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
