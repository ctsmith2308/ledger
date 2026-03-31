import { ActionError } from '@/app/_shared/lib/next-safe-action';

const NON_RETRYABLE_CODES = ['UNAUTHORIZED', 'RATE_LIMIT_EXCEEDED'];

const queryDefaults = {
  queries: {
    staleTime: 60 * 1000,
    retry: ((_: number, error: Error) => {
      if (error instanceof ActionError) {
        return !NON_RETRYABLE_CODES.includes(error.code);
      }
      return false;
    }) as (failureCount: number, error: Error) => boolean,
  },
  mutations: {
    retry: false as const,
  },
};

export { queryDefaults };
